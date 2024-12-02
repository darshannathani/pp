import { FcAdvertising, FcOnlineSupport } from "react-icons/fc";
import { FaBug, FaClipboardList } from "react-icons/fa";
import { TbDeviceAnalytics } from "react-icons/tb";
import { PiUsersThreeFill } from "react-icons/pi";

export const features = [
    {
        icon: <FcAdvertising />,
        title: 'Marketing',
        description:
            'Plan it, create it, launch it. Collaborate seamlessly with all the organization and hit your marketing goals every month with our marketing plan.',
    },
    {
        icon: <FaBug />,
        title: 'App Development Testing',
        description:
            'Provides tools and features for testing mobile and web applications, including bug reporting, crash analytics, and test automation.',
    },
    {
        icon: <FaClipboardList />,
        title: 'Public Reviews',
        description:
            'Allows users to submit both paid and free reviews, alongside the option for creators to request custom reviews.',
    },
    {
        icon: <FcOnlineSupport />,
        title: 'Customer Support',
        description:
            'Offers email, chat, or phone support to assist creators with any questions or issues.',
    },
    {
        icon: <TbDeviceAnalytics />,
        title: 'Analytics and Reporting',
        description:
            'Provides detailed insights on project performance, tester engagement, and feedback quality.',
    },
    {
        icon: <PiUsersThreeFill />,
        title: "Community Forum",
        description:
            "Connects creators for knowledge sharing and project feedback.",
    },
];

