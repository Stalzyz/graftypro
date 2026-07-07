"use client";

import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings2, AlignLeft, CheckSquare, ListOrdered, ChevronDown } from 'lucide-react';

interface MetaFormSidebarProps {
    nodeId: string;
    nodeData: any;
    onChange: (nodeId: string, data: any) => void;
}

export default function MetaFormSidebar({ nodeId, nodeData, onChange }: MetaFormSidebarProps) {
    const fields = nodeData.formFields || [];

    const handleUpdateField = (index: number, updates: any) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], ...updates };
        onChange(nodeId, { ...nodeData, formFields: newFields });
    };

    const handleRemoveField = (index: number) => {
        const newFields = fields.filter((_: any, i: number) => i !== index);
        onChange(nodeId, { ...nodeData, formFields: newFields });
    };

    const handleAddField = (type: string) => {
        const newField = {
            id: `field_${Date.now()}`,
            type: type,
            label: `New ${type}`,
            required: false,
            options: type === 'Dropdown' || type === 'RadioButtonsGroup' || type === 'CheckboxGroup' ? ['Option 1'] : []
        };
        onChange(nodeId, { ...nodeData, formFields: [...fields, newField] });
    };

    return (
        <div className="space-y-4 pt-2">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <h4 className="text-sm font-black text-indigo-900 mb-2 tracking-tight">Form Builder</h4>
                <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                    Build a native WhatsApp Form. Grafty will automatically compile this into Meta Flow JSON.
                </p>
            </div>

            <div className="space-y-3">
                {fields.map((field: any, index: number) => (
                    <div key={index} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm relative group">
                        <button 
                            onClick={() => handleRemoveField(index)}
                            className="absolute -top-2 -right-2 p-1.5 bg-rose-100 text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                        
                        <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
                            <GripVertical size={14} className="text-gray-300 cursor-grab" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{field.type}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 mb-1">Field Label</label>
                                <input 
                                    type="text" 
                                    value={field.label}
                                    onChange={(e) => handleUpdateField(index, { label: e.target.value })}
                                    className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-100 outline-none"
                                />
                            </div>

                            {(field.type === 'Dropdown' || field.type === 'RadioButtonsGroup' || field.type === 'CheckboxGroup') && (
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Options (comma separated)</label>
                                    <input 
                                        type="text" 
                                        value={(field.options || []).join(', ')}
                                        onChange={(e) => {
                                            const opts = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                                            handleUpdateField(index, { options: opts });
                                        }}
                                        className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-100 outline-none"
                                        placeholder="Option 1, Option 2..."
                                    />
                                </div>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={field.required}
                                    onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-[10px] font-bold text-gray-600">Required Field</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => handleAddField('TextInput')} className="flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black text-gray-600 transition-colors">
                    <AlignLeft size={12} /> Text Input
                </button>
                <button onClick={() => handleAddField('Dropdown')} className="flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black text-gray-600 transition-colors">
                    <ChevronDown size={12} /> Dropdown
                </button>
                <button onClick={() => handleAddField('RadioButtonsGroup')} className="flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black text-gray-600 transition-colors">
                    <ListOrdered size={12} /> Single Choice
                </button>
                <button onClick={() => handleAddField('CheckboxGroup')} className="flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[10px] font-black text-gray-600 transition-colors">
                    <CheckSquare size={12} /> Multi Choice
                </button>
            </div>
        </div>
    );
}
