'use server'

export async function logToServer(message: string, data?: any) {
  console.log(`\n\n[SERVER_LOG] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log('\n');
}
