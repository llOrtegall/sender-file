import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { pgConn } from "../config/pgConn"

class MappingUrl extends Model<InferAttributes<MappingUrl>, InferCreationAttributes<MappingUrl>> {
  declare id: CreationOptional<string>;
  declare longNameFile: string;
  declare shortId: string;
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

MappingUrl.init(
  {
    id: { type: DataTypes.STRING, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false, },
    longNameFile: { type: DataTypes.STRING, allowNull: false },
    shortId: { type: DataTypes.STRING, allowNull: false, unique: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: pgConn,
    tableName: "Mapping",
  }
);

export { MappingUrl };