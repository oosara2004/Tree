/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class BSTNode<Key, T> {

    private Key key;
    private T data;
    private BSTNode<Key, T> left;
    private BSTNode<Key, T> right;

    /**
     * Constructors
     */
    public BSTNode() {
        left = right = null;
    }

    public BSTNode(Key key, T data) {
        this.key = key;
        this.data = data;
        left = right = null;
    }

    public BSTNode(Key key, T data, BSTNode<Key, T> left,
            BSTNode<Key, T> right) {
        this.key = key;
        this.data = data;
        this.left = left;
        this.right = right;
    }

    public Key getKey() {
        return key;
    }

    public void setKey(Key key) {
        this.key = key;
    }

    /**
     * Get and set the data value
     */
    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    /**
     * Get and set the left child
     */
    public BSTNode<Key, T> getLeft() {
        return left;
    }

    public void setLeft(BSTNode<Key, T> left) {
        this.left = left;
    }

    /**
     * Get and set the right child
     */
    public BSTNode<Key, T> getRight() {
        return right;
    }

    public void setRight(BSTNode<Key, T> right) {
        this.right = right;
    }

    /**
     * @return True if a leaf node, false otherwise
     */
    public boolean isLeaf() {
        return (left == null) && (right == null);
    }

}
