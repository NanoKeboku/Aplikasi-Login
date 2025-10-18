import { prisma } from '@/lib/db';

export async function Reviews({ facilityId }: { facilityId: string }) {
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { facilityId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.review.aggregate({
      where: { facilityId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const average = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0;

  return (
    <section className="rounded-xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Ulasan Pengguna</h2>
        <div className="text-sm text-gray-600">Rata-rata: {average} ★ ({agg._count})</div>
      </div>
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className="border rounded p-3">
            <div className="text-sm text-gray-700">{r.user.name} • {new Date(r.createdAt).toLocaleDateString('id-ID')}</div>
            <div className="text-yellow-600">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
            {r.comment && <p className="text-sm text-gray-800 mt-1">{r.comment}</p>}
          </li>
        ))}
      </ul>
      <form action={`/api/reviews`} method="post" className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <input type="hidden" name="facilityId" value={facilityId} />
        <label className="text-sm sm:col-span-2">
          <span className="block mb-1 text-gray-700">Rating</span>
          <select name="rating" className="w-full border rounded px-3 py-2">
            {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-4">
          <span className="block mb-1 text-gray-700">Komentar</span>
          <input name="comment" className="w-full border rounded px-3 py-2" placeholder="Bagikan pengalaman Anda" />
        </label>
        <button className="sm:col-span-6 bg-black text-white rounded px-4 py-2">Kirim Ulasan</button>
      </form>
    </section>
  );
}
