export type FormFieldType = 'TextInput' | 'Dropdown' | 'CheckboxGroup' | 'RadioButtonsGroup' | 'OptIn';

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;
    required: boolean;
    options?: string[]; // Used for Dropdown, Checkbox, Radio
    placeholder?: string; // Used for TextInput
}

export class MetaFormCompiler {
    /**
     * Compiles a visual form schema into a strict Meta Flow JSON payload.
     * Supports a single screen layout.
     * 
     * @param fields Array of configured form fields
     * @returns A valid Meta Flow JSON object
     */
    static compileSingleScreen(fields: FormField[]): any {
        const screenId = "QUESTION_SCREEN";

        // Map visual fields to Meta components
        const components = fields.map((field, index) => {
            // Meta requires component names to only contain alphabets and underscores
            // Strip leading digits and invalid characters
            const rawId = field.id || `field_${index}`;
            const safeId = rawId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[^a-zA-Z]+/, 'f_');
            const label = field.label || `Field ${index + 1}`;

            switch (field.type) {
                case 'TextInput':
                    return {
                        type: "TextInput",
                        name: safeId,
                        label: label,
                        required: field.required,
                        "input-type": "text",
                        // "helper-text": field.placeholder || ""
                    };

                case 'Dropdown':
                    return {
                        type: "Dropdown",
                        name: safeId,
                        label: label,
                        required: field.required,
                        "data-source": (field.options || []).map((opt, i) => ({
                            id: `opt_${i}_${opt.replace(/[^a-zA-Z0-9]/g, '_')}`,
                            title: opt
                        }))
                    };

                case 'RadioButtonsGroup':
                    return {
                        type: "RadioButtonsGroup",
                        name: safeId,
                        label: label,
                        required: field.required,
                        "data-source": (field.options || []).map((opt, i) => ({
                            id: `opt_${i}_${opt.replace(/[^a-zA-Z0-9]/g, '_')}`,
                            title: opt
                        }))
                    };

                case 'CheckboxGroup':
                    return {
                        type: "CheckboxGroup",
                        name: safeId,
                        label: label,
                        required: field.required,
                        "data-source": (field.options || []).map((opt, i) => ({
                            id: `opt_${i}_${opt.replace(/[^a-zA-Z0-9]/g, '_')}`,
                            title: opt
                        }))
                    };

                case 'OptIn':
                    return {
                        type: "OptIn",
                        name: safeId,
                        label: label,
                        required: field.required
                    };

                default:
                    // Fallback to text input
                    return {
                        type: "TextInput",
                        name: safeId,
                        label: label,
                        required: field.required,
                        "input-type": "text"
                    };
            }
        });

        // Add standard submit footer
        components.push({
            type: "Footer",
            label: "Submit",
            "on-click-action": {
                name: "complete",
                payload: fields.reduce((acc: any, field, index) => {
                    const safeId = field.id || `field_${index}`;
                    acc[`${screenId}_${safeId}_${index}`] = `\${form.${safeId}}`;
                    return acc;
                }, {})
            }
        });

        // Construct full Meta JSON
        // Version 6.1 is a stable, widely-supported version as of 2025/2026.
        // Older versions (3.x, 4.x, 5.x) have been deprecated/frozen by Meta.
        return {
            version: "6.1",
            screens: [
                {
                    id: screenId,
                    title: "Please fill in the details",
                    terminal: true,
                    layout: {
                        type: "SingleColumnLayout",
                        children: [
                            {
                                type: "Form",
                                name: "flow_path",
                                children: components
                            }
                        ]
                    }
                }
            ]
        };
    }
}
