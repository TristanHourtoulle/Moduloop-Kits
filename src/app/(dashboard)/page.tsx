import Image from 'next/image';

export default function Home() {
  return (
    <div className='w-full flex flex-col items-center justify-center min-h-screen text-center gap-3'>
      <h1 className='text-4xl font-bold'>Welcome to Moduloop</h1>
      <p className='mt-4'>Your one-stop solution for all things modular.</p>
      <Image
        src='/images/moduloop-logo.png'
        alt='Moduloop Logo'
        width={200}
        height={200}
      />
    </div>
  );
}
