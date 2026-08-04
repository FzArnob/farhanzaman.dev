interface PreLoaderProps {
  image?: string;
}

export function PreLoader({ image = '/view/static/favicon.svg' }: PreLoaderProps) {
  return (
    <div className="pre-loader">
      <img src={image} alt="" />
    </div>
  );
}
