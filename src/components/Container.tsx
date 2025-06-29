import { useLaps } from "../hooks/useLaps";

function Container({ color, count = 0 }: { color: string; count: number }) {
  const { dailyTarget } = useLaps();
  const isRoundsRemaining = count <= (dailyTarget?.target ?? 0);
  return (
    <div
      className="container"
      style={{
        backgroundColor: color,
      }}
    >
      {isRoundsRemaining ? <p>Rounds Remaining</p> : <p>Keep going💫</p>}

      <span>
        {isRoundsRemaining
          ? (dailyTarget?.target ?? 0) - count
          : "+" + -1 * ((dailyTarget?.target ?? 0) - count)}
      </span>
    </div>
  );
}
export default Container;
