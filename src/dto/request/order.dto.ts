// src/orders/dto/requests/create-order.dto.ts
import {
    IsEnum, IsNumber, IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsPositive, IsUUID,
    Min,
    IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryMethodEnum, OrderStatusEnum } from 'src/common/enum/entity.enum';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateOrderItemDto {
    @ApiProperty({ description: 'Part ID' })
    @IsUUID()
    partId: string;

    @ApiProperty({ description: 'Quantity' })
    @IsNumber()
    @IsPositive()
    quantity: number;

    @ApiProperty({ description: 'Unit price', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    unitPrice?: number;

    @ApiProperty({ description: 'Discount amount', required: false, default: 0 })
    @IsNumber()
    @IsOptional()
    discount?: number = 0;
}

export class CreateOrderDto {
    @ApiProperty({ description: 'Customer name', required: false })
    @IsString()
    @IsOptional()
    customerName?: string;

    @ApiProperty({ description: 'Customer phone', required: false })
    @IsString()
    @IsOptional()
    customerPhone?: string;

    @ApiProperty({ description: 'Customer email', required: false })
    @IsEmail()
    @IsOptional()
    customerEmail?: string;

    @ApiProperty({ description: 'Order notes', required: false })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ enum: DeliveryMethodEnum, description: 'Delivery method' })
    @IsEnum(DeliveryMethodEnum)
    deliveryMethod: DeliveryMethodEnum;

    @ApiProperty({ type: [CreateOrderItemDto], description: 'Order items' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}


export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @ApiProperty({ enum: OrderStatusEnum, required: false })
    @IsEnum(OrderStatusEnum)
    @IsOptional()
    status?: OrderStatusEnum;
}


export class OrderQueryDto {
    @ApiProperty({ enum: OrderStatusEnum, required: false })
    @IsOptional()
    @IsEnum(OrderStatusEnum)
    status?: OrderStatusEnum;

    @ApiProperty({ enum: DeliveryMethodEnum, required: false })
    @IsOptional()
    @IsEnum(DeliveryMethodEnum)
    deliveryMethod?: DeliveryMethodEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customerPhone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customerEmail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ required: false, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiProperty({ required: false, default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiProperty({ enum: ['ASC', 'DESC'], required: false, default: 'DESC' })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}