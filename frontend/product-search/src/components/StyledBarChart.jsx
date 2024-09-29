import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StyledBarChart({ month, data }) {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        if (data && data.length > 0) {
            setChartData({
                labels: data.map(item => item.range),
                datasets: [
                    {
                        data: data.map(item => item.count),
                        backgroundColor: 'rgba(59, 130, 246,0.9)', // Light blue color
                        borderColor: 'rgba(91, 192, 222, 1)',
                        borderWidth: 1,
                        barPercentage: 0.5,
                        categoryPercentage: 0.8,
                    },
                ],
            });
        }
    }, [data]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: `Bar Chart Stats - ${month}`,
                font: {
                    color:'rgba(0,0,0)',
                    size: 20,
                    weight: 'bolder',
                },
                padding: {
                    top: 5,
                    bottom: 15,
                },
            },
            subtitle: {
                display: true,
                font: {
                    size: 10,
                    style: 'italic',
                },
                padding: {
                    bottom: 5,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.5)',
                    display: false,
                    drawOnChartArea: false,
                },
                border: {
                    display: true,
                },
                ticks: {
                    font: {
                        size: 8,
                    },
                },
            },
            y: {
                beginAtZero: true,
                border: {
                    display: true,
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.2)',
                    drawOnChartArea: true,
                    drawTicks: false,
                },
                ticks: {
                    font: {
                        size: 8,
                    },
                    stepSize: 1,
                    max: 100,  // Adjust this based on your data
                    padding: 5,
                },
            },
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 0,
                bottom: 0,
            },
        },
    };

    return (
        <div className="bg-blue-50 p-4 rounded-lg" style={{ height: '300px', width: '80%', maxWidth: '600px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
}

export default StyledBarChart;