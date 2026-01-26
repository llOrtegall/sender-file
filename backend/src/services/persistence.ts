import { MappingUrl } from "../models/MappingUrl"

export const saveMapping = async (shortId: string, longNameFile: string) => {
  try {
    await MappingUrl.create({ shortId, longNameFile });
  }
  catch (error) {
    console.error("Error saving URL mapping to the database:", error);
    throw new Error("DATABASE_ERROR");
  }
};

export const getOneByShortId = async (shortId: string): Promise<MappingUrl | null> => {
  try {
    const mapping = await MappingUrl.findOne({
      where: { shortId },
    });
    return mapping;
  } catch (error) {
    console.error(`Error retrieving URL mapping for shortId "${shortId}":`, error);
    throw new Error("DATABASE_ERROR");
  }
}