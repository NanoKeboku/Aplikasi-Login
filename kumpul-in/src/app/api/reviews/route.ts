import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const form = await request.formData();
  const facilityId = String(form.get('facilityId') || '');
  const rating = Number(form.get('rating'));
  const comment = (form.get('comment') as string) || undefined;

  if (!facilityId || Number.isNaN(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  }

  const demoUser = await prisma.user.findFirst({ where: { email: 'user@kumpul.in' } });
  await prisma.review.create({
    data: {
      facilityId,
      userId: demoUser!.id,
      rating,
      comment,
    },
  });

  const referer = request.headers.get('referer') || '/';
  return NextResponse.redirect(referer, { status: 303 });
}
