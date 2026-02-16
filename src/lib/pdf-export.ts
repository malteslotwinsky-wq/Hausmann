import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project } from '@/types';
import { calculateProjectProgress, formatDate } from '@/lib/utils';

function addHeader(doc: jsPDF, title: string, subtitle: string) {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(subtitle, 14, 30);
    doc.setTextColor(0);

    // Horizontal line
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);
}

export function exportProjectReport(project: Project) {
    const doc = new jsPDF();
    const progress = calculateProjectProgress(project);

    addHeader(doc, project.name, `Projektbericht - ${formatDate(new Date())}`);

    // Project Info
    let y = 42;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Projektübersicht', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const infoRows = [
        ['Adresse', project.address],
        ['Startdatum', formatDate(project.startDate)],
        ['Zieldatum', formatDate(project.targetEndDate)],
        ['Status', project.status === 'active' ? 'Aktiv' : project.status === 'completed' ? 'Abgeschlossen' : 'Pausiert'],
        ['Gesamtfortschritt', `${progress.totalPercentage}%`],
        ['Blockierte Aufgaben', `${progress.blockedCount}`],
    ];

    infoRows.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 65, y);
        y += 6;
    });

    y += 6;

    // Trades table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Gewerke-Fortschritt', 14, y);
    y += 4;

    autoTable(doc, {
        startY: y,
        head: [['Gewerk', 'Erledigt', 'In Arbeit', 'Offen', 'Blockiert', 'Fortschritt']],
        body: progress.trades.map(t => [
            t.tradeName,
            `${t.done}`,
            `${t.inProgress}`,
            `${t.open}`,
            `${t.blocked}`,
            `${t.percentage}%`,
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
    });

    // Tasks detail
    y = (doc as any).lastAutoTable?.finalY + 12 || y + 40;

    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Aufgaben-Details', 14, y);
    y += 4;

    const allTasks = project.trades.flatMap(trade =>
        trade.tasks.map(task => [
            trade.name,
            task.title,
            task.status === 'pending' ? 'Offen' : task.status === 'in_progress' ? 'In Arbeit' : task.status === 'done' ? 'Erledigt' : 'Blockiert',
            task.blockedReason || '-',
        ])
    );

    autoTable(doc, {
        startY: y,
        head: [['Gewerk', 'Aufgabe', 'Status', 'Hinweis']],
        body: allTasks,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 55 },
            2: { cellWidth: 25 },
            3: { cellWidth: 65 },
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`BauLot - ${project.name} - Seite ${i}/${pageCount}`, 14, 290);
        doc.text(formatDate(new Date()), 180, 290);
    }

    doc.save(`${project.name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}_Bericht_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportDiaryPDF(project: Project) {
    const doc = new jsPDF();

    addHeader(doc, 'Bautagebuch', `${project.name} - ${formatDate(new Date())}`);

    let y = 42;

    // Collect diary entries from tasks
    const entries: { date: Date; tradeName: string; taskTitle: string; type: string; content: string }[] = [];

    project.trades.forEach(trade => {
        trade.tasks.forEach(task => {
            if (task.status === 'done') {
                entries.push({
                    date: task.updatedAt,
                    tradeName: trade.name,
                    taskTitle: task.title,
                    type: 'Status',
                    content: 'Aufgabe abgeschlossen',
                });
            }
            if (task.status === 'blocked' && task.blockedReason) {
                entries.push({
                    date: task.updatedAt,
                    tradeName: trade.name,
                    taskTitle: task.title,
                    type: 'Problem',
                    content: task.blockedReason,
                });
            }
            task.photos.forEach(photo => {
                entries.push({
                    date: photo.uploadedAt,
                    tradeName: trade.name,
                    taskTitle: task.title,
                    type: 'Foto',
                    content: photo.caption || 'Foto hochgeladen',
                });
            });
        });
    });

    // Sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (entries.length === 0) {
        doc.setFontSize(12);
        doc.text('Noch keine Einträge im Bautagebuch.', 14, y);
    } else {
        // Summary
        doc.setFontSize(10);
        doc.text(`${entries.length} Einträge dokumentiert`, 14, y);
        y += 8;

        autoTable(doc, {
            startY: y,
            head: [['Datum', 'Gewerk', 'Aufgabe', 'Typ', 'Details']],
            body: entries.map(e => [
                formatDate(new Date(e.date)),
                e.tradeName,
                e.taskTitle,
                e.type,
                e.content,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 30 },
                2: { cellWidth: 40 },
                3: { cellWidth: 20 },
                4: { cellWidth: 65 },
            },
        });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`BauLot Bautagebuch - ${project.name} - Seite ${i}/${pageCount}`, 14, 290);
        doc.text(formatDate(new Date()), 180, 290);
    }

    doc.save(`${project.name.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}_Bautagebuch_${new Date().toISOString().split('T')[0]}.pdf`);
}
