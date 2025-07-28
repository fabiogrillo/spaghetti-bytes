import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaChartLine, 
  FaGlobeAmericas, 
  FaUsers, 
  FaClock,
  FaEye,
  FaBookOpen,
  FaLink,
  FaCalendarAlt
} from "react-icons/fa";
import { BiStats } from "react-icons/bi";
import { BsGraphUp } from "react-icons/bs";

const Visualizations = () => {
  const [timeRange, setTimeRange] = useState("week");
  const [stats, setStats] = useState({
    totalVisitors: 12847,
    uniqueVisitors: 8234,
    pageViews: 34521,
    avgSessionDuration: "3m 42s",
    bounceRate: "32.5%",
    topCountries: [
      { country: "United States", visitors: 3456, percentage: 42 },
      { country: "Italy", visitors: 2134, percentage: 26 },
      { country: "United Kingdom", visitors: 987, percentage: 12 },
      { country: "Germany", visitors: 765, percentage: 9 },
      { country: "Others", visitors: 892, percentage: 11 }
    ],
    topReferrers: [
      { source: "Google", visits: 5432, percentage: 63 },
      { source: "GitHub", visits: 1234, percentage: 14 },
      { source: "Twitter", visits: 987, percentage: 11 },
      { source: "Direct", visits: 654, percentage: 8 },
      { source: "Others", visits: 321, percentage: 4 }
    ],
    popularArticles: [
      { title: "Understanding React Hooks", views: 3456, avgTime: "5m 23s" },
      { title: "MongoDB Best Practices", views: 2987, avgTime: "4m 12s" },
      { title: "Building with Tailwind", views: 2345, avgTime: "3m 45s" },
      { title: "Node.js Performance Tips", views: 1876, avgTime: "6m 01s" },
      { title: "Data Engineering 101", views: 1654, avgTime: "7m 32s" }
    ],
    visitorTrend: [
      { day: "Mon", visitors: 1234 },
      { day: "Tue", visitors: 1456 },
      { day: "Wed", visitors: 1678 },
      { day: "Thu", visitors: 1890 },
      { day: "Fri", visitors: 2123 },
      { day: "Sat", visitors: 1987 },
      { day: "Sun", visitors: 1543 }
    ]
  });

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black hover:shadow-cartoon-hover transform transition-all hover:translate-x-1 hover:translate-y-1`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`text-4xl ${color} opacity-20`} />
      </div>
    </motion.div>
  );

  const ProgressBar = ({ label, value, percentage, color }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          className="inline-block mb-6"
          whileHover={{ scale: 1.05 }}
        >
          <span className="badge badge-lg bg-cartoon-orange text-white shadow-cartoon-sm px-6 py-3">
            <BiStats className="mr-2" size={20} />
            Analytics Dashboard
          </span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Site <span className="gradient-text-fixed">Statistics</span>
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Track your blog's performance, understand your audience, and optimize your content strategy!
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex justify-center mb-8">
        <div className="btn-group">
          {["day", "week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`btn btn-sm rounded-cartoon capitalize ${
                timeRange === range 
                  ? "bg-cartoon-purple text-white shadow-cartoon" 
                  : "btn-ghost"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={FaUsers}
          title="Total Visitors"
          value={stats.totalVisitors.toLocaleString()}
          subtitle="+12.5% from last period"
          color="text-cartoon-pink"
        />
        <StatCard
          icon={FaEye}
          title="Page Views"
          value={stats.pageViews.toLocaleString()}
          subtitle={`${stats.uniqueVisitors.toLocaleString()} unique`}
          color="text-cartoon-blue"
        />
        <StatCard
          icon={FaClock}
          title="Avg. Session"
          value={stats.avgSessionDuration}
          subtitle={`Bounce: ${stats.bounceRate}`}
          color="text-cartoon-yellow"
        />
        <StatCard
          icon={FaBookOpen}
          title="Articles Read"
          value="8,432"
          subtitle="2.3 per visitor"
          color="text-cartoon-purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Visitor Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaChartLine className="text-cartoon-pink" />
            Visitor Trend
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.visitorTrend.map((data, index) => (
              <motion.div
                key={data.day}
                className="flex-1 flex flex-col items-center"
                initial={{ height: 0 }}
                animate={{ height: `${(data.visitors / 2500) * 100}%` }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className="w-full bg-gradient-to-t from-cartoon-pink to-cartoon-purple rounded-t-cartoon"
                  style={{ height: '100%' }}
                />
                <span className="text-xs mt-2">{data.day}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Countries */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaGlobeAmericas className="text-cartoon-blue" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {stats.topCountries.map((country, index) => (
              <ProgressBar
                key={country.country}
                label={country.country}
                value={`${country.visitors.toLocaleString()} (${country.percentage}%)`}
                percentage={country.percentage}
                color={`bg-cartoon-${['pink', 'blue', 'yellow', 'purple', 'orange'][index]}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Popular Articles & Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaBookOpen className="text-cartoon-yellow" />
            Top Articles
          </h3>
          <div className="space-y-4">
            {stats.popularArticles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-cartoon hover:shadow-cartoon-sm transition-all"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{article.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Avg. read time: {article.avgTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-cartoon-yellow">{article.views.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">views</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Referrers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-cartoon shadow-cartoon border-2 border-black"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaLink className="text-cartoon-purple" />
            Traffic Sources
          </h3>
          <div className="space-y-3">
            {stats.topReferrers.map((source, index) => (
              <ProgressBar
                key={source.source}
                label={source.source}
                value={`${source.visits.toLocaleString()} visits`}
                percentage={source.percentage}
                color={`bg-cartoon-${['purple', 'pink', 'blue', 'yellow', 'orange'][index]}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Export Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <button className="btn btn-lg bg-gradient-to-r from-cartoon-pink to-cartoon-purple text-white rounded-cartoon shadow-cartoon hover:shadow-cartoon-hover">
          <BsGraphUp className="mr-2" />
          Export Full Report
        </button>
      </motion.div>
    </div>
  );
};

export default Visualizations;