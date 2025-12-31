import React, { useState } from 'react';
import './CarabinerMenu.css';

const CarabinerMenu = () => {
    const [activeTag, setActiveTag] = useState(null);

    // Configuration for each tag.
    // x/y: position relative to anchor
    // rotation: individual rotation in degrees to make it perpendicular to the arc
    // The container is rotated -58deg.
    // Vertical (gravity) was +58deg.
    // We want to fan them out.
    // Center (3) should be roughly vertical (+58).
    // Left ones (1,2) should be > 58?
    // Right ones (4,5) should be < 58?
    // Let's estimate the fanning. 
    // If the arc is roughly circular, 15-20 deg difference per tag.

    // Configuration for each tag.
    // Anchored to a CIRCLE matching the inner diameter.
    // Anchor is at the center of the loop.
    // Radius ~68px hits the inner edge.
    // Angles are in degrees relative to the center (0 is Right, 90 is Down, 180 is Left).
    // Loop opening is roughly at 135 deg to 315 deg?
    // We want the bottom arc: Angles approx 70 deg to 160 deg.

    // Helper to calculate X/Y on a circle of radius R at angle Theta.
    // x = R * cos(theta)
    // y = R * sin(theta)
    // rotation = theta + 90 (to point outward perpendicular) or theta - 90 (inward)
    // Tags hang DOWN, so perpendicular to radius.

    // Current Labels from user: Home, About Me, Photography, Advertising, Contact

    // Configuration for each tag.
    // Anchored to the HOLE center (User set 75.25% Top, 34.25% Left).
    // Radius = 85px (Visual circle width 170px).

    // Angles: Distributed approx 60 deg to 140 deg based on User Tag 1 (-30 rot).
    // Normal Rotation = Theta - 90.
    // X = 85 * cos(theta)
    // Y = 85 * sin(theta)

    const tags = [
        // Angle 60 deg -> Rot -30
        { id: 1, label: 'Home', x: 42, y: 74, rotation: -10 },
        // Angle 80 deg -> Rot -10
        { id: 2, label: 'About Me', x: 15, y: 84, rotation: 5 },
        // Angle 100 deg -> Rot 10
        { id: 3, label: 'Photography', x: -15, y: 84, rotation: 20 },
        // Angle 120 deg -> Rot 30
        { id: 4, label: 'Advertising', x: -42, y: 74, rotation: 35 },
        // Angle 140 deg -> Rot 50
        { id: 5, label: 'Contact', x: -65, y: 55, rotation: 50 }
    ];

    const getTransform = (tag, isHovered, hoveredTagId) => {
        // Base transform using the tag's explicit X/Y coordinates
        // Shift X by -27.5px (half of 55px width) to center the tag on the point.
        const baseTransform = `translate(${tag.x - 27.5}px, ${tag.y}px)`;

        // Perpendicular rotation from config
        let rotation = tag.rotation;

        // Dynamic rotation: if another tag is hovered, rotate away to create space
        if (hoveredTagId !== null && hoveredTagId !== tag.id) {
            // Calculate rotation offset based on position relative to hovered tag
            if (tag.id < hoveredTagId) {
                // Tags to the left: rotate counter-clockwise (negative)
                rotation -= 10;
            } else {
                // Tags to the right: rotate clockwise (positive)
                rotation += 10;
            }
        }

        if (isHovered) {
            // Rotate Y 0 to face camera
            // We keep the Z rotation so it stays perpendicular to its position on the arc
            // but flip it up to face the user.
            return {
                transform: `${baseTransform} rotateZ(${rotation}deg) rotateY(0deg) scale(1.1) translateY(0px)`,
                zIndex: 100
            };
        }

        // Default: Rotate Y 75 to be edge-on
        return {
            transform: `${baseTransform} rotateZ(${rotation}deg) rotateY(70deg)`,
            zIndex: 10
        };
    };

    return (
        <div className="carabiner-container">
            <div className="carabiner-wrapper">
                <img
                    src="/carabiner.png"
                    alt="Shannon Carabiner"
                    className="carabiner-img"
                />

                <div className="tags-anchor">
                    {tags.map((tag) => {
                        const isHovered = activeTag === tag.id;
                        const style = getTransform(tag, isHovered, activeTag);

                        return (
                            <div
                                key={tag.id}
                                className="tag-wrapper"
                                style={style}
                                onMouseEnter={() => setActiveTag(tag.id)}
                                onMouseLeave={() => setActiveTag(null)}
                                onClick={() => {
                                    if (tag.id === 4) {
                                        window.open('https://shannonecomer.wixsite.com/shannon/portfolio', '_blank');
                                    }
                                }}
                                title={`Tag #${tag.id}`}
                            >
                                <div className="tag-ring"></div>
                                <div className="tag-plate">
                                    {tag.label}
                                </div>
                            </div>
                        );
                    })}
                    {/* VISUAL DEBUG HELPERS */}
                    <div className="visual-circle"></div>
                    <div className="visual-center"></div>
                </div>
            </div>
        </div>
    );
};

export default CarabinerMenu;
