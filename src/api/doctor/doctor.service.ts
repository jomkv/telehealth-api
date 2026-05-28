import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardDoctorDto } from './dto/onboard-doctor.dto';
import { Prisma } from 'generated/prisma/client';
import {
  DoctorWithSpecialization,
  PopulatedDoctor,
} from 'src/shared/@types/doctor';
import { ENV_VARS } from 'src/shared/env-variables';
import { InferenceClient } from '@huggingface/inference';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<DoctorWithSpecialization | null> {
    return this.prisma.doctor.findUnique({
      where: {
        userId,
      },
      include: {
        specialization: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
      },
    });
  }

  findById(doctorId: string): Promise<PopulatedDoctor | null> {
    return this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        specialization: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            birthday: true,
            mobileNumber: true,
            isOnboarded: true,
            createdAt: true,
            profilePic: true,
          },
        },
        availability: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async searchDoctors(queryString: string): Promise<PopulatedDoctor[]> {
    const userDoctors = await this.prisma.user.findMany({
      where: {
        name: {
          search: queryString,
        },
        role: 'DOCTOR',
      },
      include: {
        doctor: {
          include: {
            specialization: {
              select: {
                id: true,
                label: true,
                description: true,
              },
            },
          },
        },
      },
    });

    const formattedDoctors = userDoctors.map((userDoctor) => {
      const { doctor, password, ...user } = userDoctor;

      return {
        ...doctor,
        user: user,
      };
    });

    return formattedDoctors;
  }

  async onboard(
    userId: string,
    dto: OnboardDoctorDto,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const existing = await tx.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Doctor already onboarded');
    }

    return await tx.doctor.create({
      data: {
        userId,
        specializationId: dto.specializationId,
        bio: dto.bio,
        yearsOfPractice: dto.yearsOfPractice,
      },
    });
  }

  getAllSpecializations(includeEmbedding: boolean = false) {
    return this.prisma.specialization.findMany({
      select: {
        id: true,
        label: true,
        description: true,
        embedding: includeEmbedding,
      },
    });
  }

  async embedText(text: string): Promise<number[]> {
    const apiKey = ENV_VARS.hfKey();
    if (!apiKey) {
      throw new Error('HF_KEY missing. Set env var before seeding.');
    }

    const client = new InferenceClient(apiKey);

    const output = await client.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
      provider: 'hf-inference',
    });

    if (!Array.isArray(output)) {
      throw new Error('Embedding output unexpected.');
    }

    return output as number[];
  }

  async findDoctorsBySymptoms(
    symptoms: string,
    topK: number = 3,
  ): Promise<{ doctors: PopulatedDoctor[]; specializations: string[] }> {
    // 1 & 2. Embed the symptom input on the fly
    const queryEmbedding = await this.embedText(symptoms);

    // 3. Pull all specializations with their embeddings and compute cosine similarity in-service
    const specializations = await this.getAllSpecializations(true);

    const cosineSimilarity = (a: number[], b: number[]): number => {
      const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
      const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
      const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
      return magA && magB ? dot / (magA * magB) : 0;
    };

    // 4. Score and rank specializations, keep top K
    const ranked = specializations
      .map((spec) => ({
        id: spec.id,
        score: cosineSimilarity(queryEmbedding, spec.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const topSpecializationIds = ranked.map((s) => s.id);
    const topSpecializationLabels = specializations
      .filter((s) => topSpecializationIds.includes(s.id))
      .map((s) => s.label);

    // 5. Query all doctors under those matched specializations
    const doctors = await this.prisma.doctor.findMany({
      where: {
        specializationId: { in: topSpecializationIds },
      },
      include: {
        specialization: {
          select: {
            id: true,
            label: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            birthday: true,
            mobileNumber: true,
            isOnboarded: true,
            createdAt: true,
            profilePic: true,
          },
        },
      },
    });

    // Re-order doctors so those under the highest-scoring specializations come first
    const scoreMap = new Map(ranked.map((s, i) => [s.id, i]));
    const rankedDoctors = doctors
      .map((doctor) => ({
        ...doctor,
        // All doctors under the same specialization share that specialization's score
        relevanceScore: Math.min(
          100,
          Math.round((scoreMap.get(doctor.specializationId) ?? 0) * 100),
        ),
      }))
      .sort(
        (a, b) =>
          (scoreMap.get(a.specializationId) ?? topK) -
          (scoreMap.get(b.specializationId) ?? topK),
      );

    return {
      doctors: rankedDoctors,
      specializations: topSpecializationLabels,
    };
  }
}
