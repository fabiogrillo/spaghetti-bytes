// client/src/utils/newsletterUtils.js

export const generateGrowthData = (range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    let subscribers = 1000;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        subscribers += Math.floor(Math.random() * 20) - 5;
        data.push({
            date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            subscribers: Math.max(0, subscribers),
            opens: Math.floor(Math.random() * 40) + 10,
            clicks: Math.floor(Math.random() * 20) + 5
        });
    }
    return data;
};
