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
        const screenId = "QUESTION_1";

        // Map visual fields to Meta components
        const components = fields.map((field, index) => {
            const safeId = field.id || `field_${index}`;
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
                            id: `${i}_${opt.replace(/\s+/g, '_')}`,
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
                            id: `${i}_${opt.replace(/\s+/g, '_')}`,
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
                            id: `${i}_${opt.replace(/\s+/g, '_')}`,
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
        const payloadData = fields.reduce((acc: any, field, index) => {
            const safeId = field.id || `field_${index}`;
            acc[`${screenId}_${safeId.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`] = `\${form.${safeId}}`;
            return acc;
        }, {});

        components.push({
            type: "Footer",
            label: "Submit",
            "on-click-action": {
                name: "complete",
                payload: payloadData
            }
        });

        // Construct full Meta JSON
        const flowJson = {
            version: "3.1",
            routing_model: {
                "QUESTION_1": []
            },
            data_api_version: "3.0",
            screens: [
                {
                    id: screenId,
                    title: "Please fill in the details",
                    data: {},
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

        return flowJson;
    }
}
