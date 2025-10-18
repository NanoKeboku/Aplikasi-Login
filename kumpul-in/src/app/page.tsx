import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma";

type SearchParams = {
  q?: string;
  city?: string;
  date?: string; // yyyy-mm-dd
};

async function getRooms(params: SearchParams) {
  const where: Prisma.RoomWhereInput = {};
  if (params.city) {
    where.facility = { is: { city: { contains: params.city } } };
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { facility: { is: { name: { contains: params.q } } } },
    ];
  }

  const rooms = await prisma.room.findMany({
    where,
    include: { facility: true, bookings: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return rooms.map((r) => ({
    id: r.id,
    name: r.name,
    capacity: r.capacity,
    amenities: r.amenities as string[],
    photos: r.photos as string[],
    facility: { id: r.facility.id, name: r.facility.name, city: r.facility.city },
  }));
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const rooms = await getRooms(searchParams);

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow-sm border">
        <h1 className="text-2xl font-semibold mb-4">Cari Ruang Komunitas</h1>
        <form className="grid grid-cols-1 sm:grid-cols-4 gap-3" action="/" method="get">
          <input name="q" placeholder="Kata kunci (aula, studio, rapat)" defaultValue={searchParams.q ?? ""} className="border rounded-md px-3 py-2" />
          <input name="city" placeholder="Kota (contoh: Bandung)" defaultValue={searchParams.city ?? ""} className="border rounded-md px-3 py-2" />
          <input name="date" type="date" defaultValue={searchParams.date ?? ""} className="border rounded-md px-3 py-2" />
          <button className="bg-black text-white rounded-md px-4 py-2">Cari</button>
        </form>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`} className="block rounded-lg overflow-hidden border bg-white hover:shadow-md transition">
            <div className="aspect-video bg-gray-100" style={{ backgroundImage: room.photos?.[0] ? `url(${room.photos[0]})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="p-4">
              <div className="text-sm text-gray-500">{room.facility.city} • {room.facility.name}</div>
              <div className="font-medium">{room.name}</div>
              <div className="text-sm text-gray-600">Kapasitas {room.capacity} orang</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(room.amenities || []).slice(0, 4).map((a) => (
                  <span key={a} className="text-xs bg-gray-100 border rounded px-2 py-0.5">{a}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
