import { useForm } from "react-hook-form";
import React from "react";
import FormInputs from "@/components/form/Forminputs";
import TextAreaInput from "@/components/form/TextAreaInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const campingSchema = z.object({
  title: z.string().min(2, "Title must be more than 2 characters"),
  price: z.number().min(1, "Price must be a positive number"),
  description: z.string().min(1, "Description is required"),
});

const Camping = () => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(campingSchema),
  });
  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <section>
      <h1 className="capitalize text-2xl font-semibold mb-4">create camping</h1>
      <div className="border p-8 rounded-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <FormInputs
              register={register}
              name="title"
              type="text"
              placeholder="Title..."
            />
            <FormInputs
              register={register}
              name="price"
              type="number"
              placeholder="Input Your Price"
            />
            <TextAreaInput
              register={register}
              type="text"
              name="description"
              placeholder="Input Your Description"
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4">
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default Camping;
