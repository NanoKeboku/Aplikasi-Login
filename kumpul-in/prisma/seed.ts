import { PrismaClient, UserRole } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const [manager, user] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'pengelola@kumpul.in' },
      update: {},
      create: {
        email: 'pengelola@kumpul.in',
        name: 'Pengelola RW 05',
        phone: '0812-0000-0000',
        role: UserRole.MANAGER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'user@kumpul.in' },
      update: {},
      create: {
        email: 'user@kumpul.in',
        name: 'Warga Setempat',
        phone: '0812-1111-2222',
        role: UserRole.USER,
      },
    }),
  ]);

  const facility = await prisma.facility.create({
    data: {
      name: 'Aula RW 05 Cihapit',
      description:
        'Aula serbaguna untuk rapat warga, kegiatan seni, dan pelatihan. Parkir motor tersedia.',
      city: 'Bandung',
      district: 'Cihapit',
      address: 'Jl. Cihapit No. 12, Bandung',
      latitude: -6.905977,
      longitude: 107.619123,
      contactName: 'Pak Jaya',
      contactPhone: '0813-2222-3333',
      contactEmail: 'rw05@kumpul.in',
      photos: [
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
        'https://images.unsplash.com/photo-1522199710521-72d69614c702',
      ],
      managerId: manager.id,
      rooms: {
        create: [
          {
            name: 'Ruang Rapat Utama',
            capacity: 40,
            amenities: ['AC', 'Proyektor', 'Kursi Lipat', 'Papan Tulis'],
            hourlyRate: 50000,
            photos: [
              'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
            ],
          },
          {
            name: 'Studio Kegiatan',
            capacity: 20,
            amenities: ['Kipas Angin', 'Sound System'],
            hourlyRate: 30000,
            photos: [
              'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b',
            ],
          },
        ],
      },
    },
    include: { rooms: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.booking.createMany({
    data: [
      {
        date: today,
        startHour: 9,
        endHour: 11,
        status: 'CONFIRMED',
        title: 'Rapat Pengurus RW',
        purpose: 'Koordinasi bulanan',
        contactName: 'Sekretaris RW',
        contactPhone: '0812-3333-4444',
        userId: user.id,
        roomId: facility.rooms[0].id,
      },
      {
        date: today,
        startHour: 14,
        endHour: 16,
        status: 'PENDING',
        title: 'Latihan Tari Anak',
        purpose: 'Kegiatan seni minggu depan',
        contactName: 'Bu Rina',
        contactPhone: '0812-5555-6666',
        userId: user.id,
        roomId: facility.rooms[0].id,
      },
    ],
  });

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Fasilitas bersih, pengelola ramah. Sangat direkomendasikan!',
      userId: user.id,
      facilityId: facility.id,
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });