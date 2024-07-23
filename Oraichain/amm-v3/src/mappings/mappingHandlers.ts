import { CosmosEvent, CosmosMessage } from "@subql/types-cosmos";
import { Message, TransferEvent } from "../types";

export async function handleMessage(msg: CosmosMessage): Promise<void> {
  const messageRecord = Message.create({
    id: `${msg.tx.hash}-${msg.idx}`,
    blockHeight: BigInt(msg.block.block.header.height),
    txHash: msg.tx.hash,
    from: msg.msg.decodedMsg.fromAddress,
    to: msg.msg.decodedMsg.toAddress,
    fee: JSON.stringify(msg.tx.decodedTx.authInfo.fee?.amount ?? []),
    denom: msg.msg.decodedMsg.amount[0]?.denom,
    amount: msg.msg.decodedMsg.amount[0]?.amount,
    status: msg.tx.tx.code.toString(),
    timestamp: msg.block.block.header.time?.valueOf().toString() ?? "0",
    type: "native",
  });
  await messageRecord.save();
}

export async function handleEvent(event: CosmosEvent): Promise<void> {
  const eventRecord = TransferEvent.create({
    id: `${event.tx.hash}-${event.msg.idx}-${event.idx}`,
    blockHeight: BigInt(event.block.block.header.height),
    txHash: event.tx.hash,
    fee: JSON.stringify(event.tx.decodedTx.authInfo.fee?.amount ?? []),
    status: event.tx.tx.code.toString(),
    timestamp: event.block.block.header.time?.valueOf().toString() ?? "0",
    recipient: "",
    amount: "",
    sender: "",
  });
  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "recipient":
        eventRecord.recipient = attr.value;
        break;
      case "amount":
        eventRecord.amount = attr.value;
        break;
      case "sender":
        eventRecord.sender = attr.value;
        break;
      default:
        break;
    }
  }
  await eventRecord.save();
}
