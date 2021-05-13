const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['kafka1:9092', 'kafka2:9092']
})

const producer = kafka.producer();

async function startProducer() {
    await producer.connect()
    await producer.send({
        topic: 'test-topic',
        messages: [
            { value: 'Hello KafkaJS user!' },
        ],
    })

    await producer.disconnect()

}

const consumer = kafka.consumer({ groupId: 'test-group' })

async function startConsumer() {
    await consumer.connect()
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })

    console.log('made it here');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value.toString(),
            })
        },
    })
}

async function start() {
    await startProducer();

    await startConsumer();
}