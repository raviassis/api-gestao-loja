function mapRecurrentToCashFlow(recurrent) {
    const {id, description, cashFlowType, value} = recurrent;
    return {
        description,
        cashFlowType: cashFlowType.id,
        value,
        datetime: new Date(),
        recurrents_id: id
    }
}
(async() => {
    const recurrentRepository = require('../data/recurrentRepository');
    const cashFlowRepository = require('../data/cashFlowRepository');
    const day = (new Date()).getUTCDate();
    const recurrents = await recurrentRepository
                                .list({where: {day}});
    console.log(`Recurrents to apply: ${recurrents.length}`);
    const cashFlows = recurrents.map(mapRecurrentToCashFlow);
    const results = await cashFlowRepository.createMany(cashFlows);
    console.log(`Recurrents applied: ${results.length}`);
})().catch(console.error)
    .finally(() => process.exit());