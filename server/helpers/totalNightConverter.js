const totalNightConverter = (sDate, eDate) => {
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round((endDate - startDate) / millisecondsPerDay);
};

module.exports = totalNightConverter;