import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["admin-analytics", dateRange],
    queryFn: async () => {
      const response = await api.get(
        `/admin/analytics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      return response.data.data;
    },
  });

  const handleExportCSV = () => {
    if (!analyticsData) return;

    // Create CSV content with all data
    const csvRows = [
      ["Analytics Report"],
      [`Period: ${dateRange.startDate} to ${dateRange.endDate}`],
      [""],
      ["Key Metrics"],
      ["Metric", "Value"],
      ["Total Revenue", `$${analyticsData.totalRevenue.toFixed(2)}`],
      ["Total Orders", analyticsData.totalOrders],
      ["Total Customers", analyticsData.totalCustomers],
      ["Average Order Value", `$${analyticsData.avgOrderValue.toFixed(2)}`],
      [""],
      ["Revenue by Payment Gateway"],
      ["Payment Method", "Orders", "Revenue", "Percentage"],
    ];

    analyticsData.revenueByGateway?.forEach((gateway: { method: string; count: number; total: number }) => {
      csvRows.push([
        gateway.method,
        gateway.count.toString(),
        `$${gateway.total.toFixed(2)}`,
        `${((gateway.total / analyticsData.totalRevenue) * 100).toFixed(1)}%`,
      ]);
    });

    csvRows.push([""], ["Top Selling Products"], ["Product", "Units Sold", "Revenue"]);

    analyticsData.topProducts?.forEach((product: { name: string; sold: number; price: number }) => {
      csvRows.push([
        product.name,
        product.sold.toString(),
        `$${(product.price * product.sold).toFixed(2)}`,
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!analyticsData) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Analytics Report", pageWidth / 2, 20, { align: "center" });

    // Date Range
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Period: ${dateRange.startDate} to ${dateRange.endDate}`,
      pageWidth / 2,
      28,
      { align: "center" }
    );

    // Key Metrics
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Key Metrics", 14, 40);

    const metricsData = [
      ["Total Revenue", `$${analyticsData.totalRevenue.toFixed(2)}`],
      ["Total Orders", analyticsData.totalOrders.toString()],
      ["Total Customers", analyticsData.totalCustomers.toString()],
      ["Average Order Value", `$${analyticsData.avgOrderValue.toFixed(2)}`],
    ];

      autoTable(doc, {
        startY: 45,
        head: [["Metric", "Value"]],
        body: metricsData,
        theme: "grid",
        headStyles: { fillColor: [79, 70, 229] },
      });

      // Revenue by Payment Gateway
      if (analyticsData.revenueByGateway?.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.text("Revenue by Payment Gateway", 14, (doc as any).lastAutoTable.finalY + 15);

      const gatewayData = analyticsData.revenueByGateway.map(
        (gateway: { method: string; count: number; total: number }) => [
          gateway.method,
          gateway.count.toString(),
          `$${gateway.total.toFixed(2)}`,
          `${((gateway.total / analyticsData.totalRevenue) * 100).toFixed(1)}%`,
        ]
      );

        autoTable(doc, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [["Payment Method", "Orders", "Revenue", "Percentage"]],
          body: gatewayData,
          theme: "grid",
          headStyles: { fillColor: [79, 70, 229] },
        });
    }

      // Top Selling Products
      if (analyticsData.topProducts?.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.text("Top Selling Products", 14, (doc as any).lastAutoTable.finalY + 15);

      const productsData = analyticsData.topProducts.map(
        (product: { name: string; sold: number; price: number }) => [
          product.name,
          product.sold.toString(),
          `$${(product.price * product.sold).toFixed(2)}`,
        ]
      );

        autoTable(doc, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [["Product", "Units Sold", "Revenue"]],
          body: productsData,
          theme: "grid",
          headStyles: { fillColor: [79, 70, 229] },
        });
    }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

      // Save PDF
      doc.save(`analytics-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF. Please try again or check the console for details.");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-base-content/60">View detailed business insights</p>
        </div>
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 mt-2 border"
          >
            <li>
              <button onClick={handleExportCSV} disabled={!analyticsData}>
                <FileSpreadsheet className="w-4 h-4" />
                Export as CSV
              </button>
            </li>
            <li>
              <button onClick={handleExportPDF} disabled={!analyticsData}>
                <FileText className="w-4 h-4" />
                Export as PDF
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card bg-base-100 border mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label md:opacity-0">
                <span className="label-text">Action</span>
              </label>
              <button className="btn btn-primary w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Total Revenue</p>
                    <h3 className="text-2xl font-bold">
                      ${analyticsData?.totalRevenue?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <DollarSign className="w-6 h-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Total Orders</p>
                    <h3 className="text-2xl font-bold">
                      {analyticsData?.totalOrders || 0}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Customers</p>
                    <h3 className="text-2xl font-bold">
                      {analyticsData?.totalCustomers || 0}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-info/10">
                    <Users className="w-6 h-6 text-info" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/60">Avg Order Value</p>
                    <h3 className="text-2xl font-bold">
                      ${analyticsData?.avgOrderValue?.toFixed(2) || "0.00"}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10">
                    <TrendingUp className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue by Payment Gateway */}
          <div className="card bg-base-100 border mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">Revenue by Payment Gateway</h2>
              {analyticsData?.revenueByGateway?.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.revenueByGateway.map((gateway: { method: string; count: number; total: number }) => (
                    <div key={gateway.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="badge badge-lg capitalize">{gateway.method}</div>
                        <span className="text-sm text-base-content/60">
                          {gateway.count} orders
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${gateway.total.toFixed(2)}</p>
                        <p className="text-xs text-base-content/60">
                          {((gateway.total / analyticsData.totalRevenue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No payment data available for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="card bg-base-100 border">
            <div className="card-body">
              <h2 className="card-title mb-4">Top Selling Products</h2>
              {analyticsData?.topProducts?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topProducts.map((product: { name: string; price: number; sold: number; image: string }, index: number) => (
                        <tr key={index}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="w-12 h-12 rounded">
                                  <img
                                    src={product.image || "/placeholder.jpg"}
                                    alt={product.name}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-sm text-base-content/60">
                                  ${product.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{product.sold}</td>
                          <td className="font-semibold">
                            ${(product.price * product.sold).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/60">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p>No product sales data available for this period</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
