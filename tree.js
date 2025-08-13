// Family Tree JavaScript Implementation
class FamilyTree {
    constructor() {
        this.members = new Map();
        this.root = null;
        this.currentEditingMember = null;
        this.svg = null;
        this.g = null;
        this.zoom = null;
        this.width = 0;
        this.height = 0;
        
        this.init();
    }

    init() {
        // Initialize Firebase auth check
        firebase.auth().onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = 'user-login.html';
                return;
            }
            this.loadFamilyTree();
        });

        this.setupEventListeners();
        this.initializeSVG();
        this.loadSampleData(); // For demo purposes
    }

    setupEventListeners() {
        // Modal controls
        document.getElementById('add-member-btn').addEventListener('click', () => this.showAddMemberModal());
        document.getElementById('add-first-member-btn').addEventListener('click', () => this.showAddMemberModal());
        document.getElementById('close-modal').addEventListener('click', () => this.hideModal());
        document.getElementById('cancel-btn').addEventListener('click', () => this.hideModal());
        
        // Form submission
        document.getElementById('member-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Tree controls
        document.getElementById('center-tree-btn').addEventListener('click', () => this.centerTree());
        document.getElementById('expand-all-btn').addEventListener('click', () => this.expandAll());
        document.getElementById('collapse-all-btn').addEventListener('click', () => this.collapseAll());
        
        // Context menu
        document.addEventListener('click', () => this.hideContextMenu());
        document.getElementById('edit-member').addEventListener('click', () => this.editSelectedMember());
        document.getElementById('add-child').addEventListener('click', () => this.addChildToSelected());
        document.getElementById('delete-member').addEventListener('click', () => this.deleteSelectedMember());
        
        // Close modal on outside click
        document.getElementById('member-modal').addEventListener('click', (e) => {
            if (e.target.id === 'member-modal') {
                this.hideModal();
            }
        });

        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                firebase.auth().signOut().then(() => {
                    window.location.href = 'user-login.html';
                }).catch(error => {
                    console.error('Logout error:', error);
                });
            });
        }
    }

    initializeSVG() {
        const container = document.getElementById('tree-svg-container');
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.svg = d3.select('#family-tree-svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Create main group for tree content
        this.g = this.svg.append('g')
            .attr('class', 'tree-content');

        // Add zoom controls
        this.addZoomControls();
    }

    addZoomControls() {
        const controls = d3.select('#tree-svg-container')
            .append('div')
            .attr('class', 'zoom-controls');

        controls.append('button')
            .attr('class', 'zoom-btn')
            .html('<i class="fas fa-plus"></i>')
            .on('click', () => {
                this.svg.transition().duration(300).call(
                    this.zoom.scaleBy, 1.5
                );
            });

        controls.append('button')
            .attr('class', 'zoom-btn')
            .html('<i class="fas fa-minus"></i>')
            .on('click', () => {
                this.svg.transition().duration(300).call(
                    this.zoom.scaleBy, 1 / 1.5
                );
            });
    }

    loadSampleData() {
        // Add sample family data for demonstration
        this.addMember('John Smith', null, 'Root', '1950-01-15', 'Family patriarch');
        this.addMember('Mary Smith', 'John Smith', 'Spouse', '1952-03-20', 'Loving wife and mother');
        this.addMember('Alice Johnson', 'John Smith', 'Child', '1975-07-10', 'Eldest daughter');
        this.addMember('Bob Smith', 'John Smith', 'Child', '1978-11-05', 'Son');
        this.addMember('Charlie Johnson', 'Alice Johnson', 'Child', '2000-04-12', 'Grandson');
        this.addMember('Diana Johnson', 'Alice Johnson', 'Child', '2003-09-18', 'Granddaughter');
        
        this.updateVisualization();
        this.updateStats();
    }

    addMember(name, parentName, relationship, birthDate = '', notes = '') {
        if (this.members.has(name)) {
            this.showMessage('Member already exists!', 'error');
            return false;
        }

        const member = {
            name: name,
            parent: parentName,
            relationship: relationship,
            birthDate: birthDate,
            notes: notes,
            children: [],
            x: 0,
            y: 0,
            collapsed: false
        };

        this.members.set(name, member);

        // Set as root if no parent or first member
        if (!parentName || this.members.size === 1) {
            this.root = member;
            member.relationship = 'Root';
        } else {
            // Add to parent's children
            const parent = this.members.get(parentName);
            if (parent) {
                parent.children.push(member);
            }
        }

        return true;
    }

    editMember(oldName, newName, parentName, relationship, birthDate, notes) {
        const member = this.members.get(oldName);
        if (!member) {
            this.showMessage('Member not found!', 'error');
            return false;
        }

        // If name is changing, update the map
        if (oldName !== newName) {
            if (this.members.has(newName)) {
                this.showMessage('A member with this name already exists!', 'error');
                return false;
            }
            
            this.members.delete(oldName);
            member.name = newName;
            this.members.set(newName, member);
            
            // Update children references
            this.members.forEach(m => {
                if (m.parent === oldName) {
                    m.parent = newName;
                }
            });
        }

        // Update other properties
        member.relationship = relationship;
        member.birthDate = birthDate;
        member.notes = notes;

        // Handle parent change
        if (member.parent !== parentName) {
            // Remove from old parent
            if (member.parent) {
                const oldParent = this.members.get(member.parent);
                if (oldParent) {
                    oldParent.children = oldParent.children.filter(child => child !== member);
                }
            }

            // Add to new parent
            member.parent = parentName;
            if (parentName) {
                const newParent = this.members.get(parentName);
                if (newParent) {
                    newParent.children.push(member);
                }
            } else {
                this.root = member;
                member.relationship = 'Root';
            }
        }

        return true;
    }

    deleteMember(name) {
        const member = this.members.get(name);
        if (!member) {
            this.showMessage('Member not found!', 'error');
            return false;
        }

        // Recursively delete all descendants
        const deleteRecursive = (m) => {
            m.children.forEach(child => deleteRecursive(child));
            this.members.delete(m.name);
        };

        // Remove from parent's children
        if (member.parent) {
            const parent = this.members.get(member.parent);
            if (parent) {
                parent.children = parent.children.filter(child => child !== member);
            }
        }

        // If deleting root, clear tree
        if (member === this.root) {
            this.members.clear();
            this.root = null;
        } else {
            deleteRecursive(member);
        }

        return true;
    }

    updateVisualization() {
        if (!this.root) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();

        // Create tree layout
        const treeLayout = d3.tree()
            .size([this.height - 100, this.width - 200])
            .separation((a, b) => a.parent === b.parent ? 1 : 2);

        // Convert our data structure to d3 hierarchy
        const hierarchy = this.createHierarchy(this.root);
        const treeData = treeLayout(hierarchy);

        // Get nodes and links
        const nodes = treeData.descendants();
        const links = treeData.descendants().slice(1);

        // Update links
        const link = this.g.selectAll('.tree-link')
            .data(links);

        link.enter()
            .append('path')
            .attr('class', 'tree-link')
            .merge(link)
            .transition()
            .duration(500)
            .attr('d', d => {
                return `M${d.y},${d.x}
                        C${(d.y + d.parent.y) / 2},${d.x}
                         ${(d.y + d.parent.y) / 2},${d.parent.x}
                         ${d.parent.y},${d.parent.x}`;
            });

        link.exit().remove();

        // Update nodes
        const node = this.g.selectAll('.tree-node')
            .data(nodes);

        const nodeEnter = node.enter()
            .append('g')
            .attr('class', 'tree-node')
            .attr('transform', d => `translate(${d.y},${d.x})`)
            .on('click', (event, d) => this.handleNodeClick(event, d))
            .on('contextmenu', (event, d) => this.handleNodeRightClick(event, d));

        // Add circles
        nodeEnter.append('circle')
            .attr('class', d => `node-circle ${d.data.relationship === 'Root' ? 'root' : ''}`)
            .attr('r', 25);

        // Add names
        nodeEnter.append('text')
            .attr('class', d => `node-text ${d.data.relationship === 'Root' ? 'root' : ''}`)
            .attr('dy', '-0.3em')
            .text(d => d.data.name);

        // Add relationships
        nodeEnter.append('text')
            .attr('class', 'node-relationship')
            .attr('dy', '1.2em')
            .text(d => d.data.relationship !== 'Root' ? d.data.relationship : '');

        // Update existing nodes
        node.merge(nodeEnter)
            .transition()
            .duration(500)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        node.exit().remove();

        // Center the tree
        this.centerTree();
    }

    createHierarchy(rootMember) {
        const createNode = (member) => {
            const node = {
                name: member.name,
                relationship: member.relationship,
                birthDate: member.birthDate,
                notes: member.notes,
                children: member.children.map(child => createNode(child))
            };
            return node;
        };

        return d3.hierarchy(createNode(rootMember));
    }

    handleNodeClick(event, d) {
        event.stopPropagation();
        // Double click to edit
        if (event.detail === 2) {
            this.showEditMemberModal(d.data.name);
        }
    }

    handleNodeRightClick(event, d) {
        event.preventDefault();
        event.stopPropagation();
        this.showContextMenu(event, d.data.name);
    }

    showContextMenu(event, memberName) {
        this.selectedMember = memberName;
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
    }

    hideContextMenu() {
        document.getElementById('context-menu').style.display = 'none';
    }

    showAddMemberModal(parentName = null) {
        this.currentEditingMember = null;
        document.getElementById('modal-title').textContent = 'Add Family Member';
        document.getElementById('member-form').reset();
        
        // Populate parent dropdown
        this.populateParentDropdown();
        
        if (parentName) {
            document.getElementById('member-parent').value = parentName;
        }
        
        document.getElementById('member-modal').style.display = 'block';
    }

    showEditMemberModal(memberName) {
        const member = this.members.get(memberName);
        if (!member) return;

        this.currentEditingMember = memberName;
        document.getElementById('modal-title').textContent = 'Edit Family Member';
        
        // Populate form
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-relationship').value = member.relationship;
        document.getElementById('member-birthdate').value = member.birthDate;
        document.getElementById('member-notes').value = member.notes;
        
        this.populateParentDropdown(memberName);
        document.getElementById('member-parent').value = member.parent || '';
        
        document.getElementById('member-modal').style.display = 'block';
    }

    populateParentDropdown(excludeName = null) {
        const select = document.getElementById('member-parent');
        select.innerHTML = '<option value="">Select Parent (Optional)</option>';
        
        this.members.forEach((member, name) => {
            if (name !== excludeName) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            }
        });
    }

    hideModal() {
        document.getElementById('member-modal').style.display = 'none';
        this.currentEditingMember = null;
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const name = formData.get('name').trim();
        const parent = formData.get('parent') || null;
        const relationship = formData.get('relationship');
        const birthDate = formData.get('birthdate');
        const notes = formData.get('notes');

        if (!name) {
            this.showMessage('Name is required!', 'error');
            return;
        }

        let success = false;
        
        if (this.currentEditingMember) {
            // Edit existing member
            success = this.editMember(this.currentEditingMember, name, parent, relationship, birthDate, notes);
            if (success) {
                this.showMessage('Member updated successfully!', 'success');
            }
        } else {
            // Add new member
            success = this.addMember(name, parent, relationship, birthDate, notes);
            if (success) {
                this.showMessage('Member added successfully!', 'success');
            }
        }

        if (success) {
            this.hideModal();
            this.updateVisualization();
            this.updateStats();
            this.saveFamilyTree();
        }
    }

    editSelectedMember() {
        if (this.selectedMember) {
            this.showEditMemberModal(this.selectedMember);
            this.hideContextMenu();
        }
    }

    addChildToSelected() {
        if (this.selectedMember) {
            this.showAddMemberModal(this.selectedMember);
            this.hideContextMenu();
        }
    }

    deleteSelectedMember() {
        if (this.selectedMember) {
            const member = this.members.get(this.selectedMember);
            const childCount = member ? member.children.length : 0;
            
            let message = `Are you sure you want to delete ${this.selectedMember}?`;
            if (childCount > 0) {
                message += `\n\nThis will also delete ${childCount} descendant(s).`;
            }
            
            if (confirm(message)) {
                if (this.deleteMember(this.selectedMember)) {
                    this.showMessage('Member deleted successfully!', 'success');
                    this.updateVisualization();
                    this.updateStats();
                    this.saveFamilyTree();
                }
            }
            this.hideContextMenu();
        }
    }

    centerTree() {
        if (!this.root) return;
        
        const bounds = this.g.node().getBBox();
        const fullWidth = this.width;
        const fullHeight = this.height;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;
        
        if (width === 0 || height === 0) return;
        
        const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
        
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }

    expandAll() {
        this.members.forEach(member => {
            member.collapsed = false;
        });
        this.updateVisualization();
    }

    collapseAll() {
        this.members.forEach(member => {
            if (member !== this.root) {
                member.collapsed = true;
            }
        });
        this.updateVisualization();
    }

    showEmptyState() {
        document.getElementById('empty-state').style.display = 'flex';
    }

    hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
    }

    updateStats() {
        const totalMembers = this.members.size;
        const generations = this.calculateGenerations();
        const lastUpdated = new Date().toLocaleDateString();

        document.getElementById('total-members').textContent = totalMembers;
        document.getElementById('total-generations').textContent = generations;
        document.getElementById('last-updated').textContent = lastUpdated;
    }

    calculateGenerations() {
        if (!this.root) return 0;
        
        const getDepth = (member, depth = 1) => {
            if (member.children.length === 0) return depth;
            return Math.max(...member.children.map(child => getDepth(child, depth + 1)));
        };
        
        return getDepth(this.root);
    }

    showMessage(text, type = 'success') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    saveFamilyTree() {
        // In a real application, save to Firebase
        const user = firebase.auth().currentUser;
        if (user) {
            const treeData = {
                members: Array.from(this.members.entries()),
                rootName: this.root ? this.root.name : null,
                lastUpdated: new Date().toISOString()
            };
            
            // Save to localStorage for demo
            localStorage.setItem(`familyTree_${user.uid}`, JSON.stringify(treeData));
            
            // In production, save to Firestore:
            // firebase.firestore().collection('familyTrees').doc(user.uid).set(treeData);
        }
    }

    loadFamilyTree() {
        const user = firebase.auth().currentUser;
        if (user) {
            // Load from localStorage for demo
            const savedData = localStorage.getItem(`familyTree_${user.uid}`);
            if (savedData) {
                try {
                    const treeData = JSON.parse(savedData);
                    this.members = new Map(treeData.members);
                    this.root = treeData.rootName ? this.members.get(treeData.rootName) : null;
                    
                    // Rebuild parent-child relationships
                    this.members.forEach(member => {
                        member.children = [];
                    });
                    
                    this.members.forEach(member => {
                        if (member.parent) {
                            const parent = this.members.get(member.parent);
                            if (parent) {
                                parent.children.push(member);
                            }
                        }
                    });
                    
                    this.updateVisualization();
                    this.updateStats();
                    return;
                } catch (error) {
                    console.error('Error loading family tree:', error);
                }
            }
        }
        
        // If no saved data, load sample data
        this.loadSampleData();
    }
}

// Initialize the family tree when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FamilyTree();
});