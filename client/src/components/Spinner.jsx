const Spinner = ({ label = "Loading" }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
    <span className="loading loading-spinner loading-lg text-primary" />
    <p className="text-sm opacity-60">{label}</p>
  </div>
);

export default Spinner;
