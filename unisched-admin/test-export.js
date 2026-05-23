// Use native fetch

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/export-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sem: { id: "test", subjects: [], sections: [] } })
    });
    console.log(res.status, res.statusText);
    if (!res.ok) {
      console.log(await res.text());
    }
  } catch(e) {
    console.error(e);
  }
}
test();
