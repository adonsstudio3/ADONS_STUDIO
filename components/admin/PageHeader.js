'use client';

export default function PageHeader({ title, description }) {
  return (
    <div className="backdrop-blur-md bg-white/10 shadow-lg border-b border-white/20 rounded-xl">
      <div className="px-6 py-4 text-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">{title}</h1>
        {description && (
          <p className="mt-2 text-white/90 drop-shadow">{description}</p>
        )}
      </div>
    </div>
  );
}
