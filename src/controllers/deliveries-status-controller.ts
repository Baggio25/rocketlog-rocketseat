import { Request, Response } from "express";

import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

class DeliveriesStatusController {
  async update(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid()
    });

    const bodySchema = z.object({
      status: z.enum(["processing", "shipped", "delivered"])
    });

    const { id } = paramsSchema.parse(request.params);
    const delivery = await prisma.delivery.findUnique({
      where : {
        id
      }
    });

    if (delivery?.status === "delivered") {
      throw new AppError('Delivery is already delivered');
    } 

    const { status } = bodySchema.parse(request.body);
    await prisma.delivery.update({
      data: {
        status
      }, 
      where: {
        id
      }
    })

    await prisma.deliveryLog.create({
      data: {
        deliveryId: id,
        description: status
      }
    });

    return response.json();
  }
}

export { DeliveriesStatusController }
