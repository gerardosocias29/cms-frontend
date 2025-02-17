import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";

const queueData = [
  { id: 1, number: "P-001", type: "Priority", severity: "danger" },
  { id: 2, number: "SP-002", type: "Senior/PWD", severity: "warning" },
  { id: 3, number: "R-003", type: "Regular", severity: "info" },
];

const locations = [
  { id: 1, name: "Location A", active: true },
  { id: 2, name: "Location B", active: false },
];

export default function QueueDisplay() {
  const [activeLocations, setActiveLocations] = useState(locations);

  const toggleLocation = (id) => {
    setActiveLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, active: !loc.active } : loc))
    );
  };

  return (
    <div className="p-4 min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Queueing System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {activeLocations.map((loc) => (
          <Card key={loc.id} className="p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">{loc.name}</h2>
            <Button
              className="mb-4"
              label={loc.active ? "Deactivate" : "Activate"}
              severity={loc.active ? "danger" : "success"}
              onClick={() => toggleLocation(loc.id)}
            />
            {loc.active && (
              <div className="space-y-2">
                {queueData.map((queue) => (
                  <Tag
                    key={queue.id}
                    value={`${queue.number} - ${queue.type}`}
                    severity={queue.severity}
                    className="p-2 text-lg"
                  />
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}