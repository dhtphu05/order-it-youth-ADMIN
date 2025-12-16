import { http, HttpResponse } from 'msw';

type MockDonationStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

type MockDonation = {
  id: string;
  donation_code: string;
  student_name: string;
  student_class: string;
  mssv: string;
  phone: string;
  amount: number;
  payment_status: MockDonationStatus;
  pvcd_points: number | null;
  created_at: string;
  confirmed_at: string | null;
};

const calculatePvcdPoints = (amount: number) => {
  if (amount < 20000) return 0;
  if (amount < 30000) return 5;
  if (amount < 50000) return 7;
  if (amount < 100000) return 8;
  return 10;
};

const donationStore: MockDonation[] = [
  {
    id: 'don-001',
    donation_code: 'DN-001-0987',
    student_name: 'Nguyễn Văn A',
    student_class: '12A1',
    mssv: 'HS123',
    phone: '0987654321',
    amount: 50000,
    payment_status: 'PENDING',
    pvcd_points: null,
    created_at: new Date().toISOString(),
    confirmed_at: null,
  },
  {
    id: 'don-002',
    donation_code: 'DN-002-0888',
    student_name: 'Trần Thị B',
    student_class: '11A2',
    mssv: 'HS456',
    phone: '0911222333',
    amount: 75000,
    payment_status: 'CONFIRMED',
    pvcd_points: calculatePvcdPoints(75000),
    created_at: new Date(Date.now() - 3600_000).toISOString(),
    confirmed_at: new Date(Date.now() - 1800_000).toISOString(),
  },
  {
    id: 'don-003',
    donation_code: 'DN-003-0777',
    student_name: 'Phạm Văn C',
    student_class: '10A5',
    mssv: 'HS789',
    phone: '0977888999',
    amount: 120000,
    payment_status: 'CONFIRMED',
    pvcd_points: calculatePvcdPoints(120000),
    created_at: new Date(Date.now() - 7200_000).toISOString(),
    confirmed_at: new Date(Date.now() - 5400_000).toISOString(),
  },
  {
    id: 'don-004',
    donation_code: 'DN-004-0666',
    student_name: 'Lê Mỹ Dung',
    student_class: '12A3',
    mssv: 'HS246',
    phone: '0966999888',
    amount: 18000,
    payment_status: 'FAILED',
    pvcd_points: 0,
    created_at: new Date(Date.now() - 5400_000).toISOString(),
    confirmed_at: null,
  },
];

export const donationMockHandlers = [
  http.get('*/api/admin/donations', ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(url.searchParams.get('limit')) || 20);
    const mssv = (url.searchParams.get('mssv') || '').toLowerCase();
    const status = url.searchParams.get('status') as MockDonationStatus | null;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let filtered = [...donationStore];

    if (mssv) {
      filtered = filtered.filter((donation) => donation.mssv.toLowerCase().includes(mssv));
    }

    if (status && ['PENDING', 'CONFIRMED', 'FAILED'].includes(status)) {
      filtered = filtered.filter((donation) => donation.payment_status === status);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((donation) => new Date(donation.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((donation) => new Date(donation.created_at) <= end);
    }

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return HttpResponse.json(
      {
        data: paginated,
        meta: {
          total,
          page,
          limit,
          pages,
        },
      },
      { status: 200 },
    );
  }),

  http.post('*/api/admin/donations/:id/confirm', ({ params }) => {
    const donationId = params.id as string;
    const donation = donationStore.find((item) => item.id === donationId);

    if (!donation) {
      return HttpResponse.json({ message: 'Donation not found' }, { status: 404 });
    }

    donation.payment_status = 'CONFIRMED';
    donation.pvcd_points = calculatePvcdPoints(donation.amount);
    donation.confirmed_at = new Date().toISOString();

    return HttpResponse.json(
      {
        id: donation.id,
        payment_status: donation.payment_status,
        pvcd_points: donation.pvcd_points,
        confirmed_at: donation.confirmed_at,
      },
      { status: 200 },
    );
  }),

  http.delete('*/api/admin/donations/:id', ({ params }) => {
    const donationId = params.id as string;
    const donationIndex = donationStore.findIndex((item) => item.id === donationId);

    if (donationIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Donation not found',
        },
        { status: 404 },
      );
    }

    donationStore.splice(donationIndex, 1);

    return HttpResponse.json(
      {
        success: true,
        message: 'Donation deleted successfully',
      },
      { status: 200 },
    );
  }),
];
