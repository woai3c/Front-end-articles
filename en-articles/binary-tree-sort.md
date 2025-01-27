# Implementing Binary Tree Traversals: Converting Recursive to Iterative Approach
Let's first review the three types of tree traversals:
1. Pre-order traversal: root-left-right
2. In-order traversal: left-root-right
3. Post-order traversal: left-right-root

Implementing binary tree traversals using recursion is straightforward. Here's an example of pre-order traversal:
```ts
const result = []
function preorderTraversal(node) {
    if (!node) return null
    result.push(node.val)
    preorderTraversal(node.left)
    preorderTraversal(node.right)
}

preorderTraversal(root)
```
We all know that when calling a function, the system maintains corresponding variables (parameters, local variables, return addresses, etc.) for each function on the stack.

For example, if we have three functions `a`, `b`, and `c`, where a calls b, and b calls c. The calling stack would look like the following diagram:

![image](https://user-images.githubusercontent.com/22117876/138593318-8f35307e-07b3-43f7-bba9-cb3c1f150e10.png)

Why am I mentioning this? Because recursive traversal follows the same process - the function keeps calling itself until it reaches the base case (termination condition). 