
"use strict";

/* ============================================================
   CODEVERSE - BULK GLOSSARY UPDATER
   Adds topic-specific glossaries to book content pages.

   Commands:
     node add-codeverse-glossary.js --dry-run
     node add-codeverse-glossary.js
     node add-codeverse-glossary.js --restore

   Features:
   - 30 topic-specific glossary sets
   - Searchable glossary
   - Alphabetical sorting
   - Dark mode compatible
   - Table of contents link
   - Preserves chapters and quizzes
   - Backups and restoration
   - Idempotent updates
============================================================ */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, "protected-books");
const PUBLIC_DIR = path.join(ROOT, "public");
const CSS_DIR = path.join(PUBLIC_DIR, "css");
const JS_DIR = path.join(PUBLIC_DIR, "js");

const DRY_RUN = process.argv.includes("--dry-run");
const RESTORE = process.argv.includes("--restore");

const BACKUP_SUFFIX = ".glossary-backup";

const CSS_PATH = path.join(CSS_DIR, "glossary.css");
const JS_PATH = path.join(JS_DIR, "glossary.js");

const START_MARKER = "<!-- CODEVERSE GLOSSARY START -->";
const END_MARKER = "<!-- CODEVERSE GLOSSARY END -->";

/* ============================================================
   VALIDATION
============================================================ */

if (!fs.existsSync(BOOKS_DIR)) {
    console.error("ERROR: protected-books not found.");
    console.error("Run from your CodeVerse project root.");
    process.exit(1);
}

/* ============================================================
   GLOSSARY DATA
   Format: [Term, Definition]
============================================================ */

const GLOSSARIES = {

    /* 1. HISTORY OF COMPUTERS */

    history: [
        ["Abacus", "An early counting device using beads."],
        ["Analytical Engine", "A proposed mechanical general-purpose computer designed by Charles Babbage."],
        ["Binary", "A numbering system using zero and one."],
        ["ENIAC", "An early electronic general-purpose digital computer."],
        ["Mainframe", "A powerful computer used for large-scale data processing."],
        ["Microprocessor", "A processor implemented on an integrated circuit."],
        ["Punch Card", "A card used to store information through punched holes."],
        ["Transistor", "An electronic component used for switching and amplification."],
        ["Vacuum Tube", "An electronic device used in early computers."],
        ["Von Neumann Architecture", "A computer design in which instructions and data share memory."]
    ],

    /* 2. COMPUTER GENERATIONS */

    generations: [
        ["First Generation", "Computers primarily using vacuum tubes."],
        ["Second Generation", "Computers primarily using transistors."],
        ["Third Generation", "Computers using integrated circuits."],
        ["Fourth Generation", "Computers associated with microprocessor technology."],
        ["Fifth Generation", "A broad classification emphasizing advanced computing and artificial intelligence."],
        ["Supercomputer", "A computer designed for extremely demanding calculations."],
        ["Mainframe", "A large computer supporting substantial processing workloads."],
        ["Minicomputer", "A historical category of midrange computer."],
        ["Microcomputer", "A computer built around a microprocessor."],
        ["Embedded Computer", "A computer integrated into a larger device."]
    ],

    /* 3. HARDWARE AND SOFTWARE */

    hardware: [
        ["CPU", "The central processing unit that executes instructions."],
        ["RAM", "Volatile memory used for active programs and data."],
        ["ROM", "Nonvolatile memory commonly used for firmware."],
        ["Motherboard", "The main circuit board connecting computer components."],
        ["GPU", "A processor specialized for graphics and parallel workloads."],
        ["SSD", "A storage device using flash memory."],
        ["HDD", "A storage device using magnetic disks."],
        ["Peripheral", "A device connected to a computer for input, output, or storage."],
        ["Operating System", "Software that manages hardware and system resources."],
        ["Application Software", "Software designed to perform user-oriented tasks."]
    ],

    /* 4. IPOS CYCLE */

    ipos: [
        ["Input", "Data entered into a computer system."],
        ["Processing", "Operations performed to transform data."],
        ["Output", "Information produced by a computer system."],
        ["Storage", "Retention of data for later use."],
        ["Input Device", "Hardware used to enter data."],
        ["Output Device", "Hardware used to present results."],
        ["Data Flow", "Movement of data between system components."],
        ["Processor", "Hardware that executes computational instructions."],
        ["Memory", "Hardware used to hold data and instructions."],
        ["Information", "Data organized into meaningful results."]
    ],

    /* 5. DATA AND NUMBER SYSTEMS */

    data: [
        ["Data", "Raw facts or values."],
        ["Information", "Data interpreted in a meaningful context."],
        ["Bit", "The smallest unit of binary information."],
        ["Byte", "A group of eight bits."],
        ["Binary", "A base-two number system."],
        ["Decimal", "A base-ten number system."],
        ["Octal", "A base-eight number system."],
        ["Hexadecimal", "A base-sixteen number system."],
        ["ASCII", "A character encoding standard."],
        ["Unicode", "A standard for representing text characters."]
    ],

    /* 6. OPERATING SYSTEM FUNDAMENTALS */

    operating: [
        ["Operating System", "Software managing computer hardware and applications."],
        ["Kernel", "The central component of an operating system."],
        ["Process", "A program in execution."],
        ["Thread", "A unit of execution within a process."],
        ["Scheduler", "An operating system component that allocates CPU time."],
        ["File System", "A structure for organizing stored files."],
        ["Device Driver", "Software that enables communication with hardware."],
        ["Virtual Memory", "A memory-management mechanism using virtual addresses."],
        ["System Call", "An interface through which software requests operating system services."],
        ["Multitasking", "The execution of multiple tasks through CPU scheduling."]
    ],

    /* 7. PROGRAMS AND PROCESSES */

    processes: [
        ["Program", "A set of instructions for a computer."],
        ["Process", "An executing instance of a program."],
        ["Thread", "An execution sequence within a process."],
        ["Multithreading", "Using multiple threads within a program."],
        ["Context Switch", "Changing the processor's active execution context."],
        ["Process State", "A condition such as ready, running, or waiting."],
        ["Process Control Block", "An operating system record describing a process."],
        ["Concurrency", "Managing multiple tasks with overlapping execution."],
        ["Parallelism", "Executing multiple operations simultaneously."],
        ["Deadlock", "A condition where processes cannot proceed because of resource dependencies."]
    ],

    /* 8. COMPUTER NETWORKS */

    networking: [
        ["Network", "Interconnected devices that exchange data."],
        ["LAN", "A local area network."],
        ["WAN", "A wide area network."],
        ["Router", "A device that forwards packets between networks."],
        ["Switch", "A device that connects devices within a network."],
        ["IP Address", "A network address used for identifying an interface."],
        ["DNS", "The system that translates domain names into resource records."],
        ["TCP", "A reliable, connection-oriented transport protocol."],
        ["UDP", "A connectionless transport protocol."],
        ["Bandwidth", "The capacity of a communication channel."]
    ],

    /* 9. CYBERSECURITY */

    cybersecurity: [
        ["Cybersecurity", "Protection of digital systems and information."],
        ["Malware", "Software intended to cause harm or unauthorized actions."],
        ["Phishing", "Deceptive communication intended to obtain information or access."],
        ["Firewall", "A mechanism for filtering network traffic."],
        ["Encryption", "Transforming information to protect confidentiality."],
        ["Authentication", "Verification of a claimed identity."],
        ["Authorization", "Determining permitted actions or resources."],
        ["Vulnerability", "A weakness that may be exploited."],
        ["Multi-Factor Authentication", "Authentication using multiple independent factors."],
        ["Digital Privacy", "Control and protection of personal information."]
    ],

    /* 10. EMERGING TECHNOLOGIES */

    emerging: [
        ["Artificial Intelligence", "Technology enabling systems to perform tasks associated with intelligence."],
        ["Machine Learning", "Methods that learn patterns from data."],
        ["Deep Learning", "Machine learning using multilayer neural networks."],
        ["Internet of Things", "A network of connected physical devices."],
        ["Cloud Computing", "Delivery of computing resources over a network."],
        ["Blockchain", "A distributed ledger structure."],
        ["Augmented Reality", "Digital content overlaid on a real-world view."],
        ["Virtual Reality", "An immersive computer-generated environment."],
        ["Automation", "Use of technology to perform tasks with reduced manual intervention."],
        ["Robotics", "Design and operation of programmable machines."]
    ],

    /* 11. INTERNET FUNDAMENTALS */

    internet: [
        ["Internet", "A global network of interconnected networks."],
        ["Website", "A collection of related web pages."],
        ["Web Browser", "Software used to access and display web content."],
        ["Web Server", "Software or hardware serving web resources."],
        ["URL", "An address identifying a resource."],
        ["HTTP", "A protocol for transferring web resources."],
        ["HTTPS", "HTTP protected by transport encryption."],
        ["DNS", "The domain name system."],
        ["ISP", "An internet service provider."],
        ["Domain Name", "A human-readable name within the DNS hierarchy."]
    ],

    /* 12. HTML STRUCTURE */

    html: [
        ["HTML", "The markup language used to structure web content."],
        ["Element", "A component represented by HTML markup."],
        ["Tag", "Markup syntax defining an HTML element."],
        ["Attribute", "Additional information provided on an element."],
        ["Semantic HTML", "Markup that communicates the meaning of content."],
        ["Header", "An element representing introductory content."],
        ["Navigation", "A section containing navigation links."],
        ["Section", "A thematic grouping of content."],
        ["Article", "A self-contained composition."],
        ["DOM", "A programming representation of a document."]
    ],

    /* 13. CSS */

    css: [
        ["CSS", "A stylesheet language for presentation and layout."],
        ["Selector", "A pattern identifying elements to style."],
        ["Property", "A CSS characteristic being configured."],
        ["Declaration", "A property-value pair in CSS."],
        ["Box Model", "The content, padding, border, and margin of an element."],
        ["Flexbox", "A one-dimensional CSS layout system."],
        ["Grid", "A two-dimensional CSS layout system."],
        ["Media Query", "A conditional rule for applying styles."],
        ["Specificity", "A mechanism for comparing competing CSS selectors."],
        ["Pseudo-Class", "A selector describing an element's state or condition."]
    ],

    /* 14. JAVASCRIPT AND DOM */

    javascript: [
        ["JavaScript", "A programming language commonly used for web interactivity."],
        ["Variable", "A named binding that stores a value."],
        ["Function", "Reusable code that performs an operation."],
        ["Event", "An occurrence handled by a program."],
        ["DOM", "The document object model."],
        ["Event Listener", "A function registered to respond to an event."],
        ["Array", "An ordered collection of values."],
        ["Object", "A collection of properties."],
        ["Callback", "A function passed for later execution."],
        ["Promise", "An object representing an asynchronous result."]
    ],

    /* 15. FORMS AND VALIDATION */

    forms: [
        ["Form", "An interface for collecting user input."],
        ["Input", "An HTML control for entering data."],
        ["Validation", "Checking data against defined rules."],
        ["Required Field", "A field that must contain an acceptable value."],
        ["Regular Expression", "A pattern used to match text."],
        ["Sanitization", "Processing input to remove or neutralize unwanted content."],
        ["Client-Side Validation", "Validation performed in the user's browser."],
        ["Server-Side Validation", "Validation performed on the server."],
        ["Submit Event", "An event triggered when a form is submitted."],
        ["Constraint Validation", "Built-in browser validation of form controls."]
    ],

    /* 16. RESPONSIVE WEB DESIGN */

    responsive: [
        ["Responsive Design", "An approach that adapts layouts to different screens."],
        ["Viewport", "The visible area of a web page."],
        ["Breakpoint", "A condition at which layout rules change."],
        ["Media Query", "A CSS rule that applies under specified conditions."],
        ["Fluid Layout", "A layout that adjusts to available space."],
        ["Flexbox", "A CSS layout model for arranging items along one axis."],
        ["CSS Grid", "A layout model for rows and columns."],
        ["Mobile-First", "Designing for smaller screens before larger ones."],
        ["Relative Unit", "A CSS measurement based on another value."],
        ["Accessibility", "Designing content to be usable by people with different abilities."]
    ],

    /* 17. USER INTERFACE */

    ui: [
        ["User Interface", "The controls and visual elements used to interact with a system."],
        ["User Experience", "The overall experience of using a product."],
        ["Accessibility", "The usability of a system for people with different abilities."],
        ["Usability", "How effectively users accomplish tasks."],
        ["Wireframe", "A simplified layout representation."],
        ["Prototype", "An early model used to test a design."],
        ["Typography", "The visual arrangement of text."],
        ["Contrast", "The visual difference between elements."],
        ["Navigation", "Controls that help users move through content."],
        ["WCAG", "Web Content Accessibility Guidelines."]
    ],

    /* 18. AUTHENTICATION */

    authentication: [
        ["Authentication", "Verification of a user's identity."],
        ["Authorization", "Determining which actions a user may perform."],
        ["Session", "Server-maintained state associated with a user interaction."],
        ["Cookie", "Data stored by a browser and sent with matching requests."],
        ["Password Hash", "A one-way representation used for password verification."],
        ["MFA", "Multi-factor authentication."],
        ["Access Control", "Restrictions on who may access resources."],
        ["CSRF", "An attack that tricks a browser into submitting an unwanted request."],
        ["XSS", "An attack involving execution of untrusted script in a browser."],
        ["Least Privilege", "Granting only the permissions required for a task."]
    ],

    /* 19. WEB SERVERS AND HTTP */

    webserver: [
        ["Web Server", "A system that handles requests for web resources."],
        ["HTTP", "Hypertext Transfer Protocol."],
        ["HTTPS", "HTTP secured using TLS."],
        ["Request", "A message asking a server to perform an operation."],
        ["Response", "A message returned in response to a request."],
        ["Status Code", "A numeric indicator of an HTTP response result."],
        ["404", "An HTTP status indicating that a resource was not found."],
        ["500", "An HTTP status indicating an internal server error."],
        ["TLS", "A protocol providing secure communication."],
        ["API", "An interface through which software systems communicate."]
    ],

    /* 20. WEBSITE TESTING */

    testing: [
        ["Testing", "Evaluating software behavior against expectations."],
        ["Unit Test", "A test of an individual component."],
        ["Integration Test", "A test of interacting components."],
        ["Deployment", "Making software available in an environment."],
        ["Hosting", "Providing infrastructure to serve a website."],
        ["Version Control", "Tracking changes to project files."],
        ["Git", "A distributed version control system."],
        ["Debugging", "Investigating and correcting software defects."],
        ["Developer Tools", "Browser tools used to inspect and debug websites."],
        ["Maintenance", "Ongoing updates and improvements to software."]
    ],

    /* 21. COMMAND LINE */

    commandline: [
        ["CLI", "Command-line interface."],
        ["Terminal", "An interface for entering text commands."],
        ["Shell", "Software that interprets commands."],
        ["Command", "An instruction entered into a shell."],
        ["Directory", "A location used to organize files."],
        ["Path", "A representation of a file or directory location."],
        ["Environment Variable", "A named value available to a process."],
        ["Script", "A sequence of instructions for automated execution."],
        ["Permission", "An access right granted to a user or process."],
        ["Process ID", "A numeric identifier associated with a process."]
    ],

    /* 22. COMPUTER PLATFORMS */

    platforms: [
        ["Platform", "An environment supporting software execution."],
        ["Architecture", "The design and instruction model of a computing system."],
        ["x86", "A family of processor instruction set architectures."],
        ["ARM", "A family of processor instruction set architectures."],
        ["Firmware", "Software closely associated with device hardware."],
        ["BIOS", "Firmware traditionally used to initialize PCs."],
        ["UEFI", "A modern firmware interface for system startup."],
        ["Compatibility", "The ability of components to work together."],
        ["Virtual Machine", "A software-defined computing environment."],
        ["Cross-Platform", "Software designed to run on multiple platforms."]
    ],

    /* 23. DEADLOCK */

    deadlock: [
        ["Deadlock", "A state in which processes wait indefinitely for one another."],
        ["Mutual Exclusion", "A condition in which a resource can be held by only one process at a time."],
        ["Hold and Wait", "Holding resources while waiting for additional resources."],
        ["No Preemption", "A condition where resources cannot be forcibly reclaimed."],
        ["Circular Wait", "A cycle of processes waiting for resources held by one another."],
        ["Resource Allocation Graph", "A graph describing process-resource relationships."],
        ["Deadlock Prevention", "Preventing at least one necessary deadlock condition."],
        ["Deadlock Avoidance", "Allocating resources to avoid unsafe states."],
        ["Safe State", "A resource-allocation state with a possible completion sequence."],
        ["Starvation", "Indefinite postponement of a process or task."]
    ],

    /* 24. DEVICE AND I/O */

    devices: [
        ["I/O", "Input and output operations."],
        ["Device Driver", "Software controlling communication with a device."],
        ["Interrupt", "A signal requesting processor attention."],
        ["Buffer", "Temporary storage used during data transfer."],
        ["Caching", "Keeping frequently used data in faster storage."],
        ["Spooling", "Queuing data for processing by a device."],
        ["DMA", "Direct memory access."],
        ["Peripheral", "An external or additional hardware device."],
        ["Polling", "Repeatedly checking device status."],
        ["Device Controller", "Hardware that manages a device's operations."]
    ],

    /* 25. FILE SYSTEMS */

    filesystem: [
        ["File System", "A system for organizing and accessing stored data."],
        ["File", "A named collection of stored data."],
        ["Directory", "A structure used to organize files."],
        ["Path", "A location within a file system."],
        ["Metadata", "Information describing other data."],
        ["Permission", "An access rule for a resource."],
        ["Partition", "A logical division of storage."],
        ["Fragmentation", "Storage of related data in separated locations."],
        ["Journaling", "Recording file system changes to aid recovery."],
        ["Mounting", "Making a file system accessible within a directory hierarchy."]
    ],

    /* 26. MEMORY MANAGEMENT */

    memory: [
        ["Memory Management", "Allocation and control of computer memory."],
        ["RAM", "Random access memory."],
        ["Virtual Memory", "A virtual address space managed by the operating system."],
        ["Paging", "Dividing memory into fixed-size units."],
        ["Page Fault", "An event requiring resolution of a virtual memory access."],
        ["Segmentation", "Dividing memory into logical regions."],
        ["Swap", "Storage used to support virtual memory management."],
        ["Memory Leak", "Memory that remains allocated when no longer needed."],
        ["Heap", "A memory region used for dynamic allocation."],
        ["Stack", "Memory commonly used for function calls and local data."]
    ],

    /* 27. MOBILE APPLICATIONS */

    mobile: [
        ["Mobile Application", "Software designed for mobile devices."],
        ["Android", "An operating system used on mobile devices."],
        ["iOS", "Apple's mobile operating system."],
        ["SDK", "Software development kit."],
        ["API", "Application programming interface."],
        ["Responsive Interface", "An interface that adapts to different display sizes."],
        ["Native App", "An application built for a particular platform."],
        ["Hybrid App", "An application combining web and native technologies."],
        ["Push Notification", "A message delivered to an application or device."],
        ["App Store", "A platform for distributing applications."]
    ],

    /* 28. OPERATING SYSTEM SERVICES */

    osservices: [
        ["System Call", "A request for a service provided by the operating system."],
        ["Kernel Mode", "A privileged processor execution mode."],
        ["User Mode", "A restricted processor execution mode."],
        ["Process Management", "Creation, scheduling, and control of processes."],
        ["Memory Management", "Allocation and protection of memory."],
        ["File Management", "Organization and control of files."],
        ["I/O Management", "Coordination of input and output devices."],
        ["Security", "Protection against unauthorized access and misuse."],
        ["Resource Allocation", "Distribution of computing resources."],
        ["System Utility", "Software supporting system maintenance and operation."]
    ],

    /* 29. THREADS AND SYNCHRONIZATION */

    threads: [
        ["Thread", "An execution unit within a process."],
        ["Concurrency", "Overlapping progress of multiple tasks."],
        ["Parallelism", "Simultaneous execution of operations."],
        ["Mutex", "A synchronization mechanism providing mutual exclusion."],
        ["Semaphore", "A synchronization primitive controlling access to resources."],
        ["Race Condition", "Behavior dependent on the timing of concurrent operations."],
        ["Critical Section", "Code accessing shared resources that require synchronization."],
        ["Synchronization", "Coordination of concurrent operations."],
        ["Thread Pool", "A collection of reusable worker threads."],
        ["Context Switch", "Switching between execution contexts."]
    ],

    /* 30. VIRTUALIZATION */

    virtualization: [
        ["Virtualization", "Creating virtual representations of computing resources."],
        ["Hypervisor", "Software or firmware that manages virtual machines."],
        ["Virtual Machine", "An isolated software-defined computer."],
        ["Host", "The physical or underlying system running virtual environments."],
        ["Guest", "An operating system running inside a virtual machine."],
        ["Container", "An isolated environment sharing an operating system kernel."],
        ["Snapshot", "A saved representation of a system's state."],
        ["Resource Allocation", "Assignment of computing resources to workloads."],
        ["Cloud Computing", "On-demand access to shared computing resources."],
        ["Isolation", "Separation between workloads or execution environments."]
    ]

};

/* ============================================================
   FILE-TO-TOPIC MAPPING

   Match the exact filenames from your CodeVerse project.

   Book1 through Book10 are assigned to the ten introductory
   computer topics.

   Named files are matched to their respective subjects.

   Unknown files are skipped.
============================================================ */

const FILE_TOPICS = {

    "book1.html": "history",
    "book2.html": "generations",
    "book3.html": "hardware",
    "book4.html": "ipos",
    "book5.html": "data",
    "book6.html": "operating",
    "book7.html": "processes",
    "book8.html": "networking",
    "book9.html": "cybersecurity",
    "book10.html": "emerging",

    "interfunda.html": "internet",
    "htmlstructure.html": "html",
    "css.html": "css",
    "javadom.html": "javascript",
    "forms.html": "forms",
    "responsiveweb.html": "responsive",
    "ui.html": "ui",
    "authentication.html": "authentication",
    "webserverhttp.html": "webserver",
    "webtesting.html": "testing",

    "commanline.html": "commandline",
    "computerplatform.html": "platforms",
    "deadlock.html": "deadlock",
    "deviceandio.html": "devices",
    "filessystem.html": "filesystem",
    "memorymanagement.html": "memory",
    "mobileandapplication.html": "mobile",
    "operatingsystem.html": "osservices",
    "processesthreads.html": "threads",
    "virtualization.html": "virtualization"

};

/* ============================================================
   HTML UTILITIES
============================================================ */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

}

function findHTMLFiles(directory) {

    const files = [];

    function walk(dir) {

        for (const entry of fs.readdirSync(dir, {
            withFileTypes: true
        })) {

            const full = path.join(dir, entry.name);

            if (entry.isDirectory()) {

                walk(full);

            } else if (
                entry.isFile() &&
                /\.html?$/i.test(entry.name)
            ) {

                files.push(full);

            }

        }

    }

    walk(directory);

    return files;
}

function backupFile(file) {

    const backup = file + BACKUP_SUFFIX;

    if (!fs.existsSync(backup)) {

        fs.copyFileSync(file, backup);

    }

}

function writeFile(file, content) {

    fs.mkdirSync(
        path.dirname(file),
        { recursive: true }
    );

    if (fs.existsSync(file)) {

        const current = fs.readFileSync(file, "utf8");

        if (current === content) {
            return false;
        }

        backupFile(file);

    }

    fs.writeFileSync(file, content, "utf8");

    return true;
}

/* ============================================================
   SHARED GLOSSARY CSS
============================================================ */

const GLOSSARY_CSS = `
/* ============================================================
   CODEVERSE GLOSSARY
============================================================ */

.cv-glossary {
    margin: 40px auto;
    padding: 30px;

    max-width: 1100px;

    background: var(--surface, #ffffff);
    color: var(--text, #202b40);

    border: 1px solid var(--border, #e6eaf1);
    border-radius: 16px;

    box-shadow: 0 8px 30px rgba(30, 50, 90, 0.06);
}

.cv-glossary,
.cv-glossary * {
    box-sizing: border-box;
}

.cv-glossary-header {
    margin-bottom: 24px;
}

.cv-glossary-header h2 {
    margin: 0 0 10px;
    color: inherit;
    font-size: 27px;
}

.cv-glossary-header p {
    margin: 0;
    color: var(--muted, #758096);
    line-height: 1.7;
}

.cv-glossary-search {
    width: 100%;
    padding: 13px 16px;
    margin-bottom: 20px;

    border: 1px solid var(--border, #dbe2ec);
    border-radius: 10px;

    background: var(--surface, #ffffff);
    color: var(--text, #202b40);

    font: inherit;
    font-size: 15px;
}

.cv-glossary-search:focus {
    outline: 2px solid #3157a4;
    outline-offset: 2px;
}

.cv-glossary-count {
    margin-bottom: 18px;
    font-size: 13px;
    color: var(--muted, #758096);
}

.cv-glossary-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 15px;
}

.cv-glossary-item {
    padding: 18px;

    background: var(--background, #f7f9fd);

    border: 1px solid var(--border, #e6eaf1);
    border-radius: 12px;
}

.cv-glossary-item h3 {
    margin: 0 0 8px;

    color: var(--primary, #3157a4);

    font-size: 16px;
}

.cv-glossary-item p {
    margin: 0;

    color: var(--text, #202b40);

    font-size: 14px;
    line-height: 1.7;
}

.cv-glossary-item[hidden] {
    display: none !important;
}

.cv-glossary-empty {
    margin-top: 15px;
    color: var(--muted, #758096);
}

.cv-glossary-empty[hidden] {
    display: none !important;
}

.cv-glossary-toc-link {
    display: block;
}

/* DARK MODE */

body.dark-mode .cv-glossary,
body.dark .cv-glossary,
html.dark .cv-glossary,
html[data-theme="dark"] .cv-glossary {
    background: #1b2940;
    color: #f1f5f9;
    border-color: #40516c;
}

body.dark-mode .cv-glossary-item,
body.dark .cv-glossary-item,
html.dark .cv-glossary-item,
html[data-theme="dark"] .cv-glossary-item {
    background: #24344c;
    border-color: #40516c;
}

body.dark-mode .cv-glossary-item h3,
body.dark .cv-glossary-item h3,
html.dark .cv-glossary-item h3,
html[data-theme="dark"] .cv-glossary-item h3 {
    color: #a8c5ff;
}

body.dark-mode .cv-glossary-item p,
body.dark .cv-glossary-item p,
html.dark .cv-glossary-item p,
html[data-theme="dark"] .cv-glossary-item p {
    color: #e2e8f0;
}

body.dark-mode .cv-glossary-search,
body.dark .cv-glossary-search,
html.dark .cv-glossary-search,
html[data-theme="dark"] .cv-glossary-search {
    background: #172235;
    color: #f1f5f9;
    border-color: #40516c;
}

body.dark-mode .cv-glossary-header p,
body.dark .cv-glossary-header p,
html.dark .cv-glossary-header p,
html[data-theme="dark"] .cv-glossary-header p,
body.dark-mode .cv-glossary-count,
body.dark .cv-glossary-count,
html.dark .cv-glossary-count,
html[data-theme="dark"] .cv-glossary-count {
    color: #b8c5d8;
}

/* RESPONSIVE */

@media (max-width: 700px) {

    .cv-glossary {
        padding: 20px;
        margin: 25px auto;
    }

    .cv-glossary-list {
        grid-template-columns: 1fr;
    }

    .cv-glossary-header h2 {
        font-size: 23px;
    }

}
`;

/* ============================================================
   SHARED GLOSSARY JAVASCRIPT
============================================================ */

const GLOSSARY_JS = `
"use strict";

/* ============================================================
   CODEVERSE GLOSSARY SEARCH
============================================================ */

(function () {

    function initializeGlossaries() {

        const glossaries =
            document.querySelectorAll(".cv-glossary");

        glossaries.forEach(function (glossary) {

            const input =
                glossary.querySelector(
                    ".cv-glossary-search"
                );

            const items = Array.from(
                glossary.querySelectorAll(
                    ".cv-glossary-item"
                )
            );

            const count =
                glossary.querySelector(
                    ".cv-glossary-count"
                );

            const empty =
                glossary.querySelector(
                    ".cv-glossary-empty"
                );

            if (!input) {
                return;
            }

            function updateSearch() {

                const query =
                    input.value.trim().toLowerCase();

                let visible = 0;

                items.forEach(function (item) {

                    const term =
                        item.querySelector("h3");

                    const definition =
                        item.querySelector("p");

                    const searchableText = [
                        term ? term.textContent : "",
                        definition
                            ? definition.textContent
                            : ""
                    ].join(" ").toLowerCase();

                    const matches =
                        searchableText.includes(query);

                    item.hidden = !matches;

                    if (matches) {
                        visible++;
                    }

                });

                if (count) {

                    count.textContent =
                        visible +
                        " of " +
                        items.length +
                        " terms";

                }

                if (empty) {
                    empty.hidden = visible !== 0;
                }

            }

            input.addEventListener(
                "input",
                updateSearch
            );

            updateSearch();

        });

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeGlossaries,
            { once: true }
        );

    } else {

        initializeGlossaries();

    }

})();
`;

/* ============================================================
   GENERATE GLOSSARY HTML
============================================================ */

function generateGlossary(topic) {

    const entries = [...GLOSSARIES[topic]]
        .sort(function (a, b) {

            return a[0].localeCompare(b[0]);

        });

    const items = entries.map(function (entry) {

        const term = escapeHTML(entry[0]);
        const definition = escapeHTML(entry[1]);

        return `
            <article class="cv-glossary-item">
                <h3>${term}</h3>
                <p>${definition}</p>
            </article>
        `;

    }).join("\n");

    return `
${START_MARKER}

<section
    class="cv-glossary chapter"
    id="glossary"
    aria-labelledby="cvGlossaryHeading"
>

    <div class="cv-glossary-header">

        <h2 id="cvGlossaryHeading">
            Glossary of Terms
        </h2>

        <p>
            Explore important terms and their
            definitions related to this book.
        </p>

    </div>

    <label
        for="cvGlossarySearch"
        class="cv-glossary-search-label"
    >
        Search glossary terms
    </label>

    <input
        type="search"
        id="cvGlossarySearch"
        class="cv-glossary-search"
        placeholder="Search a term or definition..."
        autocomplete="off"
    >

    <div
        class="cv-glossary-count"
        aria-live="polite"
    >
        ${entries.length} terms
    </div>

    <div class="cv-glossary-list">

        ${items}

    </div>

    <p
        class="cv-glossary-empty"
        hidden
    >
        No matching glossary terms found.
    </p>

</section>

${END_MARKER}
`;
}

/* ============================================================
   IDENTIFY READER FILES
============================================================ */

function getTopic(file) {

    const name = path.basename(file).toLowerCase();

    // Never add a glossary to book cover pages.
    if (name.includes("cover")) {
        return null;
    }

    return FILE_TOPICS[name] || null;
}

/* ============================================================
   ADD GLOSSARY TO THE TABLE OF CONTENTS

   Supports common static TOC structures.

   If a recognizable TOC is not found, a standalone
   Glossary link is inserted before the glossary itself.
============================================================ */

function addTOCLink(html) {

    if (
        /href=["']#glossary["']/i.test(html)
    ) {
        return html;
    }

    const tocLink = `
        <!-- CODEVERSE GLOSSARY TOC LINK -->
        <a
            href="#glossary"
            class="cv-glossary-toc-link"
        >
            Glossary of Terms
        </a>
    `;

    // Common TOC list containers.
    const patterns = [

        /(<ul\b[^>]*id=["'](?:tocList|tableOfContents|toc)["'][^>]*>)/i,

        /(<ol\b[^>]*id=["'](?:tocList|tableOfContents|toc)["'][^>]*>)/i,

        /(<nav\b[^>]*class=["'][^"']*(?:toc|table-of-contents)[^"']*["'][^>]*>)/i

    ];

    for (const pattern of patterns) {

        if (pattern.test(html)) {

            return html.replace(
                pattern,
                match => match + "\n" + tocLink
            );

        }

    }

    return html;
}

/* ============================================================
   INSERT GLOSSARY

   Preference:
   1. Before the closing main tag
   2. Before the closing article tag
   3. Before the closing body tag

   Existing book sections remain unchanged.
============================================================ */

function insertGlossary(html, glossaryHTML) {

    if (/<\/main\s*>/i.test(html)) {

        // Use the last closing main tag.
        const index =
            html.toLowerCase().lastIndexOf("</main>");

        return (
            html.slice(0, index) +
            glossaryHTML +
            "\n" +
            html.slice(index)
        );

    }

    if (/<\/article\s*>/i.test(html)) {

        const index =
            html.toLowerCase().lastIndexOf("</article>");

        return (
            html.slice(0, index) +
            glossaryHTML +
            "\n" +
            html.slice(index)
        );

    }

    return html.replace(
        /<\/body\s*>/i,
        glossaryHTML + "\n</body>"
    );
}

/* ============================================================
   UPDATE ONE HTML FILE
============================================================ */

function updateBookHTML(original, topic) {

    let html = original;

    const glossaryHTML =
        generateGlossary(topic);

    /* REMOVE PREVIOUS GENERATED GLOSSARY */

    if (
        html.includes(START_MARKER) &&
        html.includes(END_MARKER)
    ) {

        const start =
            html.indexOf(START_MARKER);

        const end =
            html.indexOf(END_MARKER) +
            END_MARKER.length;

        html =
            html.slice(0, start) +
            html.slice(end);

    } else if (
        /id=["']glossary["']/i.test(html)
    ) {

        // Avoid overwriting a manually created glossary.
        return {
            html: original,
            changed: false,
            reason: "Existing manual glossary"
        };

    }

    /* INSERT GLOSSARY */

    html = insertGlossary(
        html,
        glossaryHTML
    );

    /* ADD TOC LINK */

    html = addTOCLink(html);

    /* ADD CSS */

    if (
        !/href=["']\/css\/glossary\.css["']/i.test(html)
    ) {

        html = html.replace(
            /<\/head\s*>/i,
            '    <link rel="stylesheet" href="/css/glossary.css">\n</head>'
        );

    }

    /* ADD JAVASCRIPT */

    if (
        !/src=["']\/js\/glossary\.js["']/i.test(html)
    ) {

        html = html.replace(
            /<\/body\s*>/i,
            '    <script src="/js/glossary.js" defer></script>\n</body>'
        );

    }

    return {
        html,
        changed: html !== original,
        reason: "Updated"
    };
}

/* ============================================================
   RESTORE ORIGINAL FILES
============================================================ */

function restore() {

    let restored = 0;

    const files = findHTMLFiles(BOOKS_DIR);

    for (const file of files) {

        const backup =
            file + BACKUP_SUFFIX;

        if (!fs.existsSync(backup)) {
            continue;
        }

        fs.copyFileSync(
            backup,
            file
        );

        console.log(
            "RESTORED:",
            path.relative(ROOT, file)
        );

        restored++;
    }

    for (const sharedFile of [
        CSS_PATH,
        JS_PATH
    ]) {

        const backup =
            sharedFile + BACKUP_SUFFIX;

        if (fs.existsSync(backup)) {

            fs.copyFileSync(
                backup,
                sharedFile
            );

        }

    }

    console.log("");
    console.log("Restore complete.");
    console.log("HTML files restored:", restored);
}

/* ============================================================
   MAIN EXECUTION
============================================================ */

function main() {

    if (RESTORE) {

        restore();
        return;

    }

    console.log("");
    console.log("======================================");
    console.log("CODEVERSE GLOSSARY BULK UPDATER");
    console.log("======================================");

    if (DRY_RUN) {

        console.log(
            "DRY RUN: No files will be changed."
        );

    }

    /* SHARED FILES */

    const sharedFiles = [
        [CSS_PATH, GLOSSARY_CSS],
        [JS_PATH, GLOSSARY_JS]
    ];

    for (const [file, content] of sharedFiles) {

        const current = fs.existsSync(file)
            ? fs.readFileSync(file, "utf8")
            : null;

        if (current === content) {
            continue;
        }

        if (DRY_RUN) {

            console.log(
                "WOULD WRITE SHARED:",
                path.relative(ROOT, file)
            );

        } else {

            writeFile(file, content);

            console.log(
                "WROTE SHARED:",
                path.relative(ROOT, file)
            );

        }

    }

    /* BOOK FILES */

    const files = findHTMLFiles(BOOKS_DIR);

    let updated = 0;
    let unchanged = 0;
    let skipped = 0;

    const usedTopics = new Set();

    for (const file of files) {

        const topic = getTopic(file);

        const relative =
            path.relative(ROOT, file);

        if (!topic) {

            skipped++;
            continue;

        }

        if (!GLOSSARIES[topic]) {

            console.log(
                "SKIPPED (missing glossary):",
                relative
            );

            skipped++;
            continue;

        }

        const original =
            fs.readFileSync(file, "utf8");

        if (
            !/<\/head\s*>/i.test(original) ||
            !/<\/body\s*>/i.test(original)
        ) {

            console.log(
                "SKIPPED (invalid HTML):",
                relative
            );

            skipped++;
            continue;

        }

        const result =
            updateBookHTML(original, topic);

        if (!result.changed) {

            console.log(
                "UNCHANGED:",
                relative,
                "-",
                result.reason
            );

            unchanged++;
            continue;

        }

        if (DRY_RUN) {

            console.log(
                "WOULD UPDATE:",
                relative,
                "=>",
                topic
            );

        } else {

            backupFile(file);

            fs.writeFileSync(
                file,
                result.html,
                "utf8"
            );

            console.log(
                "UPDATED:",
                relative,
                "=>",
                topic
            );

        }

        usedTopics.add(topic);

        updated++;

    }

    console.log("");
    console.log("======================================");
    console.log("GLOSSARY UPDATE COMPLETE");
    console.log("======================================");

    console.log("Total HTML files:", files.length);

    console.log(
        DRY_RUN ? "Would update:" : "Updated:",
        updated
    );

    console.log("Unchanged:", unchanged);
    console.log("Skipped (including covers):", skipped);
    console.log("Topics processed:", usedTopics.size);

    console.log("======================================");

    console.log(
        "Backups use:",
        BACKUP_SUFFIX
    );

    console.log(
        "Test the book pages locally before deployment."
    );

}

main();
