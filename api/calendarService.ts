export async function fetchAppointments() {
  const res = await fetch('/api/appointments');
  if (!res.ok) throw new Error('Gagal memuat data appointment');
  return res.json();
}

export async function createAppointment(data: object) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal menambah appointment');
  return res.json();
}

export async function updateAppointment(id: string | number, data: object) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal update appointment');
  return res.json();
}

export async function deleteAppointment(id: string | number) {
  const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal hapus appointment');
  return res.json();
}

export async function fetchQueue() {
  const res = await fetch('/api/queue');
  if (!res.ok) throw new Error('Gagal memuat data antrian');
  return res.json();
}

export async function createQueue(data: object) {
  const res = await fetch('/api/queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal menambah antrian');
  return res.json();
}

export async function updateQueue(id: string | number, data: object) {
  const res = await fetch(`/api/queue/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Gagal update antrian');
  return res.json();
}

export async function deleteQueue(id: string | number) {
  const res = await fetch(`/api/queue/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal hapus antrian');
  return res.json();
} 