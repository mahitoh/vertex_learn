import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
export default function FinanceDashboard() {
  const [summary, setSummary] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    axios.get("/api/finance/expenses/summary").then((res) => setSummary(res.data));
    axios.get("/api/finance/campaigns").then((res) => setCampaigns(res.data));
  }, []);
  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      {/* Expenses Pie Chart */}
      <div className="bg-white shadow-md p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Expenses Summary</h2>
        <Pie
          data={{
            labels: Object.keys(summary),
            datasets: [
              {
                data: Object.values(summary),
                backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
              },
            ],
          }}
        />
      </div>
      {/* Campaigns Bar Chart */}
      <div className="bg-white shadow-md p-4 rounded-xl">
        <h2 className="text-xl font-bold mb-4">Marketing Campaigns</h2>
        <Bar
          data={{
            labels: campaigns.map((c) => c.name),
            datasets: [
              {
                label: "Leads",
                data: campaigns.map((c) => c.leads),
              },
              {
                label: "Conversions",
                data: campaigns.map((c) => c.conversions),
              },
            ],
          }}
        />
      </div>
    </div>
  );
}