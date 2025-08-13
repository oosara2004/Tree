import java.util.*;

/**
 * Family Tree Implementation
 * Represents a family tree where each node contains a person's information
 * and can have multiple children (descendants).
 */
public class Tree {
    private TreeNode root;
    private Map<String, TreeNode> nodeMap; // For quick lookup by name
    private int totalMembers;

    /**
     * Inner class representing a person in the family tree
     */
    public static class TreeNode {
        private String name;
        private String birthDate;
        private String relationship;
        private TreeNode parent;
        private List<TreeNode> children;
        private Map<String, String> additionalInfo;

        public TreeNode(String name) {
            this.name = name;
            this.children = new ArrayList<>();
            this.additionalInfo = new HashMap<>();
        }

        public TreeNode(String name, String birthDate, String relationship) {
            this(name);
            this.birthDate = birthDate;
            this.relationship = relationship;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getBirthDate() { return birthDate; }
        public void setBirthDate(String birthDate) { this.birthDate = birthDate; }
        
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        
        public TreeNode getParent() { return parent; }
        public void setParent(TreeNode parent) { this.parent = parent; }
        
        public List<TreeNode> getChildren() { return children; }
        
        public Map<String, String> getAdditionalInfo() { return additionalInfo; }
        
        public void addChild(TreeNode child) {
            if (child != null && !children.contains(child)) {
                children.add(child);
                child.setParent(this);
            }
        }
        
        public boolean removeChild(TreeNode child) {
            if (children.remove(child)) {
                child.setParent(null);
                return true;
            }
            return false;
        }
        
        public void addInfo(String key, String value) {
            additionalInfo.put(key, value);
        }
        
        public String getInfo(String key) {
            return additionalInfo.get(key);
        }
    }

    /**
     * Constructor - Initialize empty family tree
     */
    public Tree() {
        this.nodeMap = new HashMap<>();
        this.totalMembers = 0;
    }

    /**
     * Constructor with root person
     */
    public Tree(String rootName) {
        this();
        this.root = new TreeNode(rootName, null, "Root");
        nodeMap.put(rootName.toLowerCase(), root);
        totalMembers = 1;
    }

    /**
     * Add a new family member under a specific parent
     * @param childName Name of the new family member
     * @param parentName Name of the parent (null for root)
     * @param relationship Relationship to parent
     * @return true if successfully added, false otherwise
     */
    public boolean addNode(String childName, String parentName, String relationship) {
        if (childName == null || childName.trim().isEmpty()) {
            return false;
        }

        childName = childName.trim();
        
        // Check if person already exists
        if (nodeMap.containsKey(childName.toLowerCase())) {
            return false; // Person already exists
        }

        TreeNode newNode = new TreeNode(childName, null, relationship);

        // If no parent specified or tree is empty, make this the root
        if (parentName == null || parentName.trim().isEmpty() || root == null) {
            if (root == null) {
                root = newNode;
                newNode.setRelationship("Root");
            } else {
                return false; // Root already exists
            }
        } else {
            // Find parent node
            TreeNode parent = findNode(parentName.trim());
            if (parent == null) {
                return false; // Parent not found
            }
            parent.addChild(newNode);
        }

        nodeMap.put(childName.toLowerCase(), newNode);
        totalMembers++;
        return true;
    }

    /**
     * Edit an existing family member's information
     * @param oldName Current name of the person
     * @param newName New name (can be same as old)
     * @param newBirthDate New birth date
     * @param newRelationship New relationship
     * @return true if successfully edited, false otherwise
     */
    public boolean editNode(String oldName, String newName, String newBirthDate, String newRelationship) {
        if (oldName == null || oldName.trim().isEmpty()) {
            return false;
        }

        TreeNode node = findNode(oldName.trim());
        if (node == null) {
            return false; // Person not found
        }

        // If name is changing, update the map
        if (newName != null && !newName.trim().isEmpty() && !newName.trim().equals(oldName.trim())) {
            String newNameLower = newName.trim().toLowerCase();
            
            // Check if new name already exists
            if (nodeMap.containsKey(newNameLower)) {
                return false; // New name already exists
            }
            
            // Remove old mapping and add new one
            nodeMap.remove(oldName.trim().toLowerCase());
            node.setName(newName.trim());
            nodeMap.put(newNameLower, node);
        }

        // Update other information
        if (newBirthDate != null) {
            node.setBirthDate(newBirthDate.trim());
        }
        
        if (newRelationship != null && !newRelationship.trim().isEmpty()) {
            node.setRelationship(newRelationship.trim());
        }

        return true;
    }

    /**
     * Delete a family member and all their descendants
     * @param name Name of the person to delete
     * @return true if successfully deleted, false otherwise
     */
    public boolean deleteNode(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }

        TreeNode nodeToDelete = findNode(name.trim());
        if (nodeToDelete == null) {
            return false; // Person not found
        }

        // Count nodes to be deleted (including descendants)
        int deletedCount = countDescendants(nodeToDelete) + 1;

        // If deleting root, clear entire tree
        if (nodeToDelete == root) {
            clear();
            return true;
        }

        // Remove from parent's children list
        TreeNode parent = nodeToDelete.getParent();
        if (parent != null) {
            parent.removeChild(nodeToDelete);
        }

        // Remove from map (including all descendants)
        removeFromMap(nodeToDelete);
        
        totalMembers -= deletedCount;
        return true;
    }

    /**
     * Find a node by name
     * @param name Name to search for
     * @return TreeNode if found, null otherwise
     */
    public TreeNode findNode(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        return nodeMap.get(name.trim().toLowerCase());
    }

    /**
     * Get the tree structure as a formatted string for display
     * @return String representation of the tree
     */
    public String displayTree() {
        if (root == null) {
            return "Family tree is empty.";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("Family Tree Structure:\n");
        sb.append("======================\n");
        displayTreeHelper(root, "", true, sb);
        sb.append("\nTotal family members: ").append(totalMembers);
        return sb.toString();
    }

    /**
     * Get tree structure as JSON-like format for web display
     * @return JSON string representation
     */
    public String getTreeAsJSON() {
        if (root == null) {
            return "{}";
        }
        
        StringBuilder sb = new StringBuilder();
        buildJSONHelper(root, sb);
        return sb.toString();
    }

    /**
     * Get all family members as a list
     * @return List of all family member names
     */
    public List<String> getAllMembers() {
        List<String> members = new ArrayList<>();
        if (root != null) {
            collectAllMembers(root, members);
        }
        return members;
    }

    /**
     * Get children of a specific person
     * @param parentName Name of the parent
     * @return List of children names
     */
    public List<String> getChildren(String parentName) {
        TreeNode parent = findNode(parentName);
        List<String> childrenNames = new ArrayList<>();
        
        if (parent != null) {
            for (TreeNode child : parent.getChildren()) {
                childrenNames.add(child.getName());
            }
        }
        
        return childrenNames;
    }

    /**
     * Get parent of a specific person
     * @param childName Name of the child
     * @return Parent name or null if no parent
     */
    public String getParent(String childName) {
        TreeNode child = findNode(childName);
        if (child != null && child.getParent() != null) {
            return child.getParent().getName();
        }
        return null;
    }

    /**
     * Clear the entire tree
     */
    public void clear() {
        root = null;
        nodeMap.clear();
        totalMembers = 0;
    }

    /**
     * Get total number of family members
     * @return Total count
     */
    public int getTotalMembers() {
        return totalMembers;
    }

    /**
     * Get root node
     * @return Root TreeNode
     */
    public TreeNode getRoot() {
        return root;
    }

    // Helper methods

    private void displayTreeHelper(TreeNode node, String prefix, boolean isLast, StringBuilder sb) {
        if (node == null) return;

        sb.append(prefix);
        sb.append(isLast ? "└── " : "├── ");
        sb.append(node.getName());
        
        if (node.getBirthDate() != null && !node.getBirthDate().isEmpty()) {
            sb.append(" (").append(node.getBirthDate()).append(")");
        }
        
        if (node.getRelationship() != null && !node.getRelationship().isEmpty() && !node.getRelationship().equals("Root")) {
            sb.append(" [").append(node.getRelationship()).append("]");
        }
        
        sb.append("\n");

        List<TreeNode> children = node.getChildren();
        for (int i = 0; i < children.size(); i++) {
            boolean isLastChild = (i == children.size() - 1);
            String newPrefix = prefix + (isLast ? "    " : "│   ");
            displayTreeHelper(children.get(i), newPrefix, isLastChild, sb);
        }
    }

    private void buildJSONHelper(TreeNode node, StringBuilder sb) {
        sb.append("{");
        sb.append("\"name\":\"").append(escapeJSON(node.getName())).append("\",");
        sb.append("\"relationship\":\"").append(escapeJSON(node.getRelationship() != null ? node.getRelationship() : "")).append("\",");
        sb.append("\"birthDate\":\"").append(escapeJSON(node.getBirthDate() != null ? node.getBirthDate() : "")).append("\",");
        sb.append("\"children\":[");
        
        List<TreeNode> children = node.getChildren();
        for (int i = 0; i < children.size(); i++) {
            if (i > 0) sb.append(",");
            buildJSONHelper(children.get(i), sb);
        }
        
        sb.append("]}");
    }

    private String escapeJSON(String str) {
        if (str == null) return "";
        return str.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }

    private void collectAllMembers(TreeNode node, List<String> members) {
        if (node == null) return;
        
        members.add(node.getName());
        for (TreeNode child : node.getChildren()) {
            collectAllMembers(child, members);
        }
    }

    private int countDescendants(TreeNode node) {
        if (node == null) return 0;
        
        int count = 0;
        for (TreeNode child : node.getChildren()) {
            count += 1 + countDescendants(child);
        }
        return count;
    }

    private void removeFromMap(TreeNode node) {
        if (node == null) return;
        
        nodeMap.remove(node.getName().toLowerCase());
        for (TreeNode child : node.getChildren()) {
            removeFromMap(child);
        }
    }

    // Main method for testing
    public static void main(String[] args) {
        Tree familyTree = new Tree("John Smith");
        
        // Add family members
        familyTree.addNode("Mary Smith", "John Smith", "Spouse");
        familyTree.addNode("Alice Smith", "John Smith", "Daughter");
        familyTree.addNode("Bob Smith", "John Smith", "Son");
        familyTree.addNode("Charlie Smith", "Alice Smith", "Grandson");
        
        // Display tree
        System.out.println(familyTree.displayTree());
        
        // Test editing
        familyTree.editNode("Alice Smith", "Alice Johnson", "1990-05-15", "Daughter");
        
        // Display updated tree
        System.out.println("\nAfter editing Alice:");
        System.out.println(familyTree.displayTree());
        
        // Test JSON output
        System.out.println("\nJSON representation:");
        System.out.println(familyTree.getTreeAsJSON());
    }
}