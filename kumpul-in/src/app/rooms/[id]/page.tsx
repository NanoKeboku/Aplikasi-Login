import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Reviews } from './reviews';

function hoursRange(start: number, end: number) {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

export default async function RoomDetail({ params }: { params: { id: string } }) {
  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: { facility: true, bookings: true },
  });
  if (!room) return notFound();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysBookings = room.bookings.filter(
    (b) => new Date(b.date).getTime() === today.getTime()
  );

  const reservedHours = new Set<number>();
  for (const b of todaysBookings) {
    for (const h of hoursRange(b.startHour, b.endHour)) reservedHours.add(h);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden border bg-white">
        <div
          className="aspect-video bg-gray-100"
          style={{
            backgroundImage: (room.photos as string[])?.[0]
              ? `url(${(room.photos as string[])[0]})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="p-4">
          <div className="text-sm text-gray-500">
            {room.facility.city} • {room.facility.name}
          </div>
          <h1 className="text-2xl font-semibold">{room.name}</h1>
          <div className="text-gray-700">Kapasitas {room.capacity} orang</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {((room.amenities as string[]) || []).map((a) => (
              <span key={a} className="text-xs bg-gray-100 border rounded px-2 py-0.5">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-medium mb-3">Ketersediaan Hari Ini</h2>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {hoursRange(8, 22).map((h) => (
            <div
              key={h}
              className={`text-center text-sm px-2 py-2 rounded border ${reservedHours.has(h) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}
            >
              {h}:00
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-medium mb-3">Ajukan Reservasi (Tanpa Pembayaran Online)</h2>
        <form action={`/api/bookings`} method="post" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="hidden" name="roomId" value={room.id} />
          <label className="text-sm">
            <span className="block mb-1 text-gray-700">Tanggal</span>
            <input name="date" type="date" className="w-full border rounded px-3 py-2" required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Mulai</span>
              <input name="startHour" type="number" min={0} max={23} className="w-full border rounded px-3 py-2" required />
            </label>
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Selesai</span>
              <input name="endHour" type="number" min={1} max={24} className="w-full border rounded px-3 py-2" required />
            </label>
          </div>
          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-gray-700">Judul Acara</span>
            <input name="title" className="w-full border rounded px-3 py-2" required />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-gray-700">Tujuan</span>
            <input name="purpose" className="w-full border rounded px-3 py-2" required />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-gray-700">Nama PIC</span>
            <input name="contactName" className="w-full border rounded px-3 py-2" required />
          </label>
          <label className="text-sm">
            <span className="block mb-1 text-gray-700">No. HP</span>
            <input name="contactPhone" className="w-full border rounded px-3 py-2" required />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="block mb-1 text-gray-700">Catatan</span>
            <input name="notes" className="w-full border rounded px-3 py-2" />
          </label>
          <button className="sm:col-span-2 bg-black text-white rounded px-4 py-2">Kirim Permohonan</button>
          <p className="sm:col-span-2 text-xs text-gray-500">Pembayaran dilakukan manual sesuai arahan pengelola. Anda akan menerima konfirmasi melalui kontak yang dicantumkan.</p>
        </form>
      </section>
      <Reviews facilityId={room.facilityId} />
    </div>
  );
}
