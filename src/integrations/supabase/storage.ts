import { supabase } from "./client";

export const uploadFile = async (file: File) => {
  const { data, error } = await supabase.storage
    .from("uploads") // Assuming a bucket named 'uploads'
    .upload(`public/${file.name}`, file);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};