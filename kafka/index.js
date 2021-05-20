const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092']
})

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

// async function startProducer() {
//     await producer.connect()
//     await producer.send({
//         topic: 'testTopic',
//         messages: [
//             { value: 'Hello KafkaJS user!' },
//         ],
//     })

//     await producer.disconnect()

// }


// async function startConsumer() {
//     await consumer.connect()
//     await consumer.subscribe({ topic: 'testTopic', fromBeginning: true })

//     console.log('made it here');

//     await consumer.run({
//         eachMessage: async ({ topic, partition, message }) => {
//             console.log({
//                 value: message.value.toString(),
//             })
//         },
//     })
// }

// async function start() {
//     await startProducer();

//     await startConsumer();
// }

// start();

module.exports = {
    producer,
    consumer
}