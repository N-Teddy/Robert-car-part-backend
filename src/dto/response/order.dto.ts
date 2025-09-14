// src/orders/dto/responses/order-response.dto.ts
import { OrderStatusEnum, DeliveryMethodEnum } from 'src/common/enum/entity.enum';
import { ApiProperty } from '@nestjs/swagger';
import { PartResponseDto } from './part.dto';


export class OrderItemResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    discount: number;

    @ApiProperty()
    total: number;

    @ApiProperty({ type: PartResponseDto })
    part: PartResponseDto;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class OrderResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: OrderStatusEnum })
    status: OrderStatusEnum;

    @ApiProperty()
    totalAmount: number;

    @ApiProperty({ required: false })
    customerName?: string;

    @ApiProperty({ required: false })
    customerPhone?: string;

    @ApiProperty({ required: false })
    customerEmail?: string;

    @ApiProperty({ required: false })
    notes?: string;

    @ApiProperty({ enum: DeliveryMethodEnum })
    deliveryMethod: DeliveryMethodEnum;

    @ApiProperty({ type: [OrderItemResponseDto] })
    items: OrderItemResponseDto[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}


class StatusCountDto {
    @ApiProperty()
    status: string;

    @ApiProperty()
    count: number;
}

class MethodCountDto {
    @ApiProperty()
    method: string;

    @ApiProperty()
    count: number;
}

export class OrderStatsResponseDto {
    @ApiProperty()
    totalOrders: number;

    @ApiProperty()
    totalRevenue: number;

    @ApiProperty()
    pendingOrders: number;

    @ApiProperty()
    completedOrders: number;

    @ApiProperty()
    cancelledOrders: number;

    @ApiProperty({ type: [StatusCountDto] })
    ordersByStatus: StatusCountDto[];

    @ApiProperty({ type: [MethodCountDto] })
    ordersByDeliveryMethod: MethodCountDto[];

    @ApiProperty()
    averageOrderValue: number;
}


class MetaDto {
    @ApiProperty()
    total: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    totalPages: number;

    @ApiProperty()
    hasNext: boolean;

    @ApiProperty()
    hasPrev: boolean;
}

export class PaginatedOrdersResponseDto {
    @ApiProperty({ type: [OrderResponseDto] })
    items: OrderResponseDto[];

    @ApiProperty({ type: MetaDto })
    meta: MetaDto;
}