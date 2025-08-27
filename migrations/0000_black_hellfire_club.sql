CREATE TABLE "deliveries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"delivery_person_id" varchar,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_at" timestamp,
	"picked_up_at" timestamp,
	"delivered_at" timestamp,
	"estimated_distance" numeric,
	"actual_distance" numeric,
	"estimated_time" integer,
	"actual_time" integer,
	"delivery_fee" numeric NOT NULL,
	"tips" numeric DEFAULT '0',
	"tracking_updates" json,
	"delivery_proof" text,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "delivery_personnel" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"employee_id" text NOT NULL,
	"license_number" text,
	"vehicle_type" text,
	"vehicle_number" text,
	"is_available" boolean DEFAULT true,
	"current_location" json,
	"rating" numeric DEFAULT '5.0',
	"completed_deliveries" integer DEFAULT 0,
	"emergency_contact" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "delivery_personnel_employee_id_unique" UNIQUE("employee_id")
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"dietary_tags" text[],
	"allergens" text[],
	"nutrition_info" json,
	"preparation_time" integer DEFAULT 15,
	"spice_level" integer DEFAULT 0,
	"is_available" boolean DEFAULT true,
	"is_popular" boolean DEFAULT false,
	"discount" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"student_id" varchar NOT NULL,
	"restaurant_id" varchar NOT NULL,
	"status" text NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text,
	"subtotal" numeric NOT NULL,
	"delivery_fee" numeric DEFAULT '0' NOT NULL,
	"tax" numeric DEFAULT '0' NOT NULL,
	"discount" numeric DEFAULT '0' NOT NULL,
	"total_amount" numeric NOT NULL,
	"delivery_address" text NOT NULL,
	"delivery_instructions" text,
	"estimated_delivery_time" timestamp,
	"actual_delivery_time" timestamp,
	"order_items" json NOT NULL,
	"special_instructions" text,
	"cancellation_reason" text,
	"rating" integer,
	"review" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cuisine" text NOT NULL,
	"business_license" text NOT NULL,
	"campus_location" text NOT NULL,
	"address" text,
	"rating" numeric DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"delivery_time" text NOT NULL,
	"price_for_two" integer NOT NULL,
	"image_url" text,
	"cover_image_url" text,
	"operating_hours" json,
	"is_active" boolean DEFAULT true,
	"is_verified" boolean DEFAULT false,
	"minimum_order" integer DEFAULT 0,
	"delivery_fee" integer DEFAULT 0,
	"preparation_time" integer DEFAULT 30,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"student_id" text NOT NULL,
	"dormitory" text,
	"room_number" text,
	"meal_plan" text,
	"dietary_restrictions" text[],
	"emergency_contact" text,
	"graduation_year" integer,
	"major" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"is_verified" boolean DEFAULT false,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_delivery_person_id_delivery_personnel_id_fk" FOREIGN KEY ("delivery_person_id") REFERENCES "public"."delivery_personnel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_personnel" ADD CONSTRAINT "delivery_personnel_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;