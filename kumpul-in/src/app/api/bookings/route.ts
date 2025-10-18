import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';

export async function POST(request: Request) {
  const form = await request.formData();
  const roomId = String(form.get('roomId') || '');
  const dateStr = String(form.get('date') || '');
  const startHour = Number(form.get('startHour'));
  const endHour = Number(form.get('endHour'));
  const title = String(form.get('title') || '');
  const purpose = String(form.get('purpose') || '');
  const contactName = String(form.get('contactName') || '');
  const contactPhone = String(form.get('contactPhone') || '');
  const notes = (form.get('notes') as string) || undefined;

  if (!roomId || !dateStr || Number.isNaN(startHour) || Number.isNaN(endHour)) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }
  if (startHour < 0 || endHour > 24 || endHour <= startHour) {
    return NextResponse.json({ error: 'Rentang jam tidak valid' }, { status: 400 });
  }

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  const conflict = await prisma.booking.findFirst({
    where: {
      roomId,
      date,
      OR: [
        { AND: [{ startHour: { lt: endHour } }, { endHour: { gt: startHour } }] },
      ],
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  });
  if (conflict) {
    return NextResponse.json({ error: 'Jadwal bentrok, pilih jam lain.' }, { status: 409 });
  }

  const demoUser = await prisma.user.findFirst({ where: { email: 'user@kumpul.in' } });
  const booking = await prisma.booking.create({
    data: {
      roomId,
      userId: demoUser!.id,
      date,
      startHour,
      endHour,
      title,
      purpose,
      contactName,
      contactPhone,
      notes,
      status: 'PENDING',
    },
  });
  // Notify manager (if configured)
  try {
    const room = await prisma.room.findUnique({ include: { facility: true }, where: { id: roomId } });
    if (room?.facility.contactEmail) {
      await sendMail({
        to: room.facility.contactEmail,
        subject: `Permohonan Reservasi: ${title}`,
        text: `Permohonan reservasi untuk ruangan ${room.name} pada ${date.toDateString()} ${startHour}:00-${endHour}:00 oleh ${contactName} (${contactPhone}).`,
      });
    }
  } catch (e) {
    console.log('[mailer] failed', e);
  }

  return NextResponse.redirect(`/rooms/${roomId}?submitted=${booking.id}`, { status: 303 });
}
