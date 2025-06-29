import { useEffect, useState } from "react";
import { useLaps } from "../hooks/useLaps";
import Container from "./Container";

function MainContent() {
  const { laps, loading, error, addLap } = useLaps();
  const [lapCount, setLapCount] = useState(0);

  useEffect(() => {
    setLapCount(laps.length);
  }, [laps]);

  const handleAddLap = async (count: number) => {
    const success = await addLap(count);
    if (success) {
      setLapCount(count);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="main-content">
      <Container color="#4CCD99" count={lapCount} />
      <div className="container-grid"></div>
      <div className="buttons">
        <button
          className="count-button"
          style={{ backgroundColor: "#FFF455", color: "#000000" }}
          onClick={() => handleAddLap(lapCount + 1)}
        >
          Count
        </button>
      </div>
      <div>
        <h2 style={{ textAlign: "center" }}>Total Entries: {laps.length}</h2>

        <table
          style={{
            width: "95%",
            textAlign: "center",
            borderCollapse: "collapse",
            margin: "10px auto",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Timestamp
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Nth Round
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Time Between <br />
                Rounds
              </th>
            </tr>
          </thead>
          <tbody>
            {laps.map((lap, index) => {
              const previousLap = laps[index - 1];
              const timeBetweenRounds = previousLap
                ? `${(
                    (new Date(lap.timestamp).getTime() -
                      new Date(previousLap.timestamp).getTime()) /
                    1000
                  ).toFixed(2)} seconds`
                : "N/A";
              return (
                <tr key={lap.id}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {new Date(lap.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {lap.count} Round
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {timeBetweenRounds}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MainContent;
