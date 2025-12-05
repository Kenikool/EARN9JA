import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface ChatMessageAttributes {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  message: string;
  messageType: "text" | "image" | "file" | "system";
  isRead: boolean;
  readAt?: Date;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ChatMessageCreationAttributes
  extends Optional<
    ChatMessageAttributes,
    "id" | "isRead" | "readAt" | "metadata" | "createdAt" | "updatedAt"
  > {}

class ChatMessage
  extends Model<ChatMessageAttributes, ChatMessageCreationAttributes>
  implements ChatMessageAttributes
{
  public id!: string;
  public conversationId!: string;
  public senderId!: string;
  public recipientId!: string;
  public message!: string;
  public messageType!: "text" | "image" | "file" | "system";
  public isRead!: boolean;
  public readAt?: Date;
  public metadata?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment:
        "Unique identifier for the conversation (e.g., taskId or userId pair)",
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM("text", "image", "file", "system"),
      defaultValue: "text",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Additional metadata like file URLs, image URLs, etc.",
    },
  },
  {
    sequelize,
    tableName: "ChatMessages",
    timestamps: true,
    indexes: [
      {
        fields: ["conversationId"],
      },
      {
        fields: ["senderId"],
      },
      {
        fields: ["recipientId"],
      },
      {
        fields: ["createdAt"],
      },
      {
        fields: ["isRead"],
      },
    ],
  }
);

export { ChatMessage };
