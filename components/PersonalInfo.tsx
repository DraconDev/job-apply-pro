import React, { useEffect, useState } from "react";

interface Education {
    degree: string;
    school: string;
    graduationYear: string;
}

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    linkedInProfile: string;
    githubProfile: string;
    portfolioWebsite: string;
    yearsOfExperience: string;
    education: Education;
}

interface ValidationErrors {
    [key: string]: string;
}

const defaultPersonalInfo: PersonalInfo = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    linkedInProfile: "",
    githubProfile: "",
    portfolioWebsite: "",
    yearsOfExperience: "",
    education: {
        degree: "",
        school: "",
        graduationYear: "",
    },
};

export default function PersonalInfo() {
    const [info, setInfo] = useState<PersonalInfo>(defaultPersonalInfo);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        chrome.storage.sync.get(["personalInfo"], (result) => {
            if (result.personalInfo) {
                setInfo(result.personalInfo);
            }
        });
    }, []);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case "firstName":
            case "lastName":
                return value.trim().length < 2
                    ? "Must be at least 2 characters"
                    : "";
            case "email":
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    ? "Please enter a valid email address"
                    : "";
            case "phone":
                // Allow empty phone or validate format
                return value && !/^\+?[\d\s-()]{10,}$/.test(value)
                    ? "Please enter a valid phone number"
                    : "";
            case "linkedInProfile":
                return value &&
                    !/^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(
                        value
                    )
                    ? "Please enter a valid LinkedIn profile URL"
                    : "";
            case "githubProfile":
                return value &&
                    !/^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/.test(value)
                    ? "Please enter a valid GitHub profile URL"
                    : "";
            case "portfolioWebsite":
                return value && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value)
                    ? "Please enter a valid website URL"
                    : "";
            case "yearsOfExperience":
                return isNaN(Number(value)) || Number(value) < 0
                    ? "Please enter a valid number of years"
                    : "";
            case "education.graduationYear":
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                return value &&
                    (isNaN(year) || year < 1900 || year > currentYear + 10)
                    ? "Please enter a valid graduation year"
                    : "";
            default:
                return "";
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        if (name.startsWith("education.")) {
            const field = name.split(".")[1];
            setInfo((prev) => ({
                ...prev,
                education: {
                    ...prev.education,
                    [field]: value,
                },
            }));
        } else {
            setInfo((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const formatPhoneNumber = (value: string): string => {
        // Remove all non-digits
        const cleaned = value.replace(/\D/g, "");
        // Format as (XXX) XXX-XXXX
        if (cleaned.length >= 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(
                3,
                6
            )}-${cleaned.slice(6, 10)}`;
        }
        return value;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatPhoneNumber(e.target.value);
        setInfo((prev) => ({
            ...prev,
            phone: formattedValue,
        }));
        setErrors((prev) => ({
            ...prev,
            phone: validateField("phone", formattedValue),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: ValidationErrors = {};
        Object.entries(info).forEach(([key, value]) => {
            if (key !== "education") {
                const error = validateField(key, value as string);
                if (error) newErrors[key] = error;
            }
        });

        Object.entries(info.education).forEach(([key, value]) => {
            const error = validateField(`education.${key}`, value);
            if (error) newErrors[`education.${key}`] = error;
        });

        // If there are any errors, don't submit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        chrome.storage.sync.set({ personalInfo: info }, () => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        });
    };

    const renderInput = (
        name: string,
        label: string,
        type: string = "text",
        placeholder: string = "",
        required: boolean = false
    ) => (
        <div className="input-group">
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label}
                {required && <span className="text-rose-500 ml-1">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={
                    name.includes("education")
                        ? String(
                              info.education[
                                  name.split(".")[1] as keyof Education
                              ] || ""
                          )
                        : String(info[name as keyof PersonalInfo] || "")
                }
                onChange={name === "phone" ? handlePhoneChange : handleChange}
                className={`w-full px-3 py-2 bg-slate-50 border text-slate-900 ${
                    errors[name] ? 'border-rose-500' : 'border-slate-300'
                } rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors`}
                placeholder={placeholder}
                required={required}
            />
            {errors[name] && (
                <p className="text-rose-500 text-sm mt-1">{errors[name]}</p>
            )}
        </div>
    );

    return (
        <div className="py-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-slate-200/75">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
                    {saved && (
                        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-md flex items-center justify-center animate-fadeIn ml-4 shadow-sm">
                            <svg
                                className="w-5 h-5 mr-2 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span className="whitespace-nowrap font-medium">
                                Saved successfully!
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Details Section */}
                    <div className="form-section">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderInput(
                                "firstName",
                                "First Name",
                                "text",
                                "",
                                true
                            )}
                            {renderInput(
                                "lastName",
                                "Last Name",
                                "text",
                                "",
                                true
                            )}
                            {renderInput("email", "Email", "email", "", true)}
                            {renderInput(
                                "phone",
                                "Phone",
                                "tel",
                                "(XXX) XXX-XXXX"
                            )}
                            {renderInput(
                                "location",
                                "Location",
                                "text",
                                "City, State"
                            )}
                            {renderInput(
                                "yearsOfExperience",
                                "Years of Experience",
                                "number",
                                "0",
                                false
                            )}
                        </div>
                    </div>

                    {/* Online Presence Section */}
                    <div className="form-section">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Online Presence</h3>
                        <div className="space-y-4">
                            {renderInput(
                                "linkedInProfile",
                                "LinkedIn Profile",
                                "url",
                                "https://linkedin.com/in/..."
                            )}
                            {renderInput(
                                "githubProfile",
                                "GitHub Profile",
                                "url",
                                "https://github.com/..."
                            )}
                            {renderInput(
                                "portfolioWebsite",
                                "Portfolio Website",
                                "url",
                                "https://your-portfolio.com"
                            )}
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="form-section">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Education</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderInput(
                                "education.degree",
                                "Degree",
                                "text",
                                "e.g., Bachelor of Science in Computer Science"
                            )}
                            {renderInput(
                                "education.school",
                                "School",
                                "text",
                                "University name"
                            )}
                            {renderInput(
                                "education.graduationYear",
                                "Graduation Year",
                                "text",
                                "YYYY"
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary">
                            Save Information
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
