import { useStreaks } from "../hooks/useStreaks";

function NavBar() {
  const {
    loading: streaksLoading,
    error: streaksError,
    getStreakStats,
  } = useStreaks();

  const streakStats = getStreakStats();
  const loading = streaksLoading;
  const error = streaksError;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="nav-bar">
      <h2 style={{ textAlign: "center" }}>Trackie</h2>
      <span>🔥{streakStats?.currentStreak}</span>
    </div>
  );
}

export default NavBar;
