"use client";

import { HomeIcon, ChevronRightIcon } from "@heroicons/react/24/solid"; // Import Heroicons

interface BreadcrumbItem {
    label: string;
    href?: string; // Optional, if the item is a link
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]; // Array of breadcrumb items
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex text-gray-700 rounded-lg bg-gray-50" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                {/* Always display the "Home" item */}
                <li className="inline-flex items-center">
                    <a
                        href="/"
                        className="inline-flex items-center text-sm font-light text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                        <HomeIcon className="w-3 h-3 me-2.5" aria-hidden="true" /> {/* Thinner and smaller icon */}
                        Beranda
                    </a>
                </li>

                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            {/* Chevron Icon */}
                            <ChevronRightIcon
                                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                                aria-hidden="true"
                            />
                            {item.href ? (
                                <a
                                    href={item.href}
                                    className="ms-1 text-sm font-light text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <span className="ms-1 text-sm font-light text-gray-500 md:ms-2 dark:text-gray-400">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
