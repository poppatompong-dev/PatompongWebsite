"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Calendar, CheckCircle } from "lucide-react";
import type { TimelineEvent } from "@prisma/client";

interface Props {
    events: TimelineEvent[];
}

export default function TimelineClient({ events }: Props) {
    if (events.length === 0) return null;

    return (
        <div className="relative">
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-400/60 via-cream-300 to-transparent lg:-translate-x-px" />

            <div className="space-y-12">
                {events.map((item, index) => {
                    const isTraining = item.category === "Training";
                    const Icon = isTraining ? Calendar : Briefcase;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative flex flex-col lg:flex-row items-start gap-8 ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                }`}
                        >
                            <div className="absolute left-8 lg:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-cream-100 border-2 border-gold-400 z-10 mt-6 lg:mt-8 flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5 text-gold-500" />
                            </div>

                            <div className={`ml-16 lg:ml-0 lg:w-[calc(50%-2rem)] w-full ${index % 2 === 0 ? "lg:pr-8" : "lg:pl-8"}`}>
                                <div className="card-retro rounded-sm p-6 lg:p-8 transition-all duration-300 bg-white/40 hover:bg-white/60">
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <Calendar className="w-4 h-4 text-gold-500" />
                                        <span className="font-code text-sm text-gold-600 font-bold">
                                            {new Date(item.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="ml-2 px-2 py-0.5 text-[10px] font-code bg-gold-400/10 text-gold-600 border border-gold-400/30 uppercase tracking-wider rounded-sm">
                                            {item.category}
                                        </span>
                                    </div>

                                    <h3 className="font-heading text-xl font-bold text-ink-800 mb-2">{item.title}</h3>

                                    {(item.location || item.imageUrl) && (
                                        <div className="flex flex-col gap-2 text-sm text-ink-500 mb-4 font-medium">
                                            {item.location && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-ink-400" />
                                                    <span>{item.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-ink-600 leading-relaxed text-sm whitespace-pre-wrap">{item.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
