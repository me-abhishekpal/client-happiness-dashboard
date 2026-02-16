'use client';

import React from 'react';
import { OrgNode } from './OrgNode';

interface UserNode {
    id: string;
    name: string | null;
    email: string;
    titleRel?: { name: string } | null;
    roleRel?: { name: string } | null;
    directReports?: UserNode[];
}

interface OrgTreeProps {
    data: UserNode;
}

export function OrgChartTree({ data }: OrgTreeProps) {
    return (
        <div className="org-chart-container py-12">
            <style jsx global>{`
                .tf-tree ul {
                    display: inline-flex;
                    padding-top: 20px; 
                    position: relative;
                    transition: all 0.5s;
                }
                .tf-tree li {
                    align-items: center;
                    display: flex;
                    flex-direction: column;
                    flex-wrap: nowrap;
                    padding-top: 20px; 
                    position: relative;
                }
                .tf-tree li::before, .tf-tree li::after{
                    content: '';
                    position: absolute; top: 0; right: 50%;
                    border-top: 1px solid #ccc;
                    width: 50%; height: 20px;
                }
                .tf-tree li::after{
                    right: auto; left: 50%;
                    border-left: 1px solid #ccc;
                }
                .tf-tree li:only-child::after, .tf-tree li:only-child::before {
                    display: none;
                }
                .tf-tree li:only-child{ 
                    padding-top: 0;
                }
                .tf-tree li:first-child::before, .tf-tree li:last-child::after{
                    border: 0 none;
                }
                .tf-tree li:last-child::before{
                    border-right: 1px solid #ccc;
                    border-radius: 0 5px 0 0;
                }
                .tf-tree li:first-child::after{
                    border-radius: 5px 0 0 0;
                }
                .tf-tree ul ul::before{
                    content: '';
                    position: absolute; top: 0; left: 50%;
                    border-left: 1px solid #ccc;
                    width: 0; height: 20px;
                }
                .tf-node-content {
                    display: inline-block;
                    border: 1px solid #ccc;
                    padding: 5px 10px;
                    text-decoration: none;
                    color: #666;
                    font-family: arial, verdana, tahoma;
                    font-size: 11px;
                    display: inline-block;
                    border-radius: 5px;
                    transition: all 0.5s;
                }

                /* Override specific styles for our custom card */
                .tf-tree .tf-node-content {
                    border: none;
                    padding: 0;
                    background: transparent;
                }
            `}</style>

            <div className="tf-tree text-center">
                <ul>
                    <TreeNode node={data} />
                </ul>
            </div>
        </div>
    );
}

const TreeNode = ({ node }: { node: UserNode }) => {
    return (
        <li>
            <div className="tf-node-content relative z-10">
                <OrgNode user={node} />
            </div>
            {node.directReports && node.directReports.length > 0 && (
                <ul>
                    {node.directReports.map((child) => (
                        <TreeNode key={child.id} node={child} />
                    ))}
                </ul>
            )}
        </li>
    );
};
