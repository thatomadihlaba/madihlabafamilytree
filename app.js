/**
 * Family Tree App
 * 
 * Reads family-data.js and dynamically renders a family tree.
 * To update the tree, edit family-data.js and refresh the page.
 */

const DEFAULT_AVATAR_SVG = `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>
  </svg>
`;

// Color palette for connection lines - each parent group gets a different color
const LINE_COLORS = [
  '#5b6abf', '#e85d9c', '#2e9e6b', '#d4740e', '#8e44ad',
  '#c0392b', '#2980b9', '#27ae60', '#f39c12', '#16a085',
  '#e74c3c', '#3498db', '#9b59b6', '#e67e22', '#1abc9c'
];

// Store connection metadata for highlighting
let connectionGroups = [];

/**
 * Create the avatar element for a member
 */
function createAvatar(member) {
  const avatarWrapper = document.createElement('div');
  avatarWrapper.className = 'member-avatar';

  if (member.image && member.image.trim() !== '') {
    const img = document.createElement('img');
    img.src = member.image;
    img.alt = `Photo of ${member.name}`;
    img.onerror = function () {
      this.parentElement.innerHTML = `<div class="default-avatar">${DEFAULT_AVATAR_SVG}</div>`;
    };
    avatarWrapper.appendChild(img);
  } else {
    avatarWrapper.innerHTML = `<div class="default-avatar">${DEFAULT_AVATAR_SVG}</div>`;
  }

  return avatarWrapper;
}

/**
 * Create a member card element
 */
function createMemberCard(member) {
  const card = document.createElement('div');
  card.className = `member-card gen-${member.generation}`;

  if (member.side) {
    card.classList.add(member.side);
  }

  card.dataset.id = member.id;

  const avatar = createAvatar(member);
  const info = document.createElement('div');
  info.className = 'member-info';
  info.innerHTML = `
    <span class="member-name">${member.name}</span>
    <span class="member-role">${member.role}</span>
  `;

  card.appendChild(avatar);
  card.appendChild(info);

  return card;
}

/**
 * Group members by generation
 */
function groupByGeneration(members) {
  const generations = {};
  members.forEach(member => {
    const gen = member.generation;
    if (!generations[gen]) {
      generations[gen] = [];
    }
    generations[gen].push(member);
  });
  return generations;
}

/**
 * Find couples (members who share children)
 */
function findCouples(members, generation) {
  const genMembers = members.filter(m => m.generation === generation);
  const couples = [];
  const paired = new Set();

  const children = members.filter(m => m.parents && m.parents.length === 2);

  children.forEach(child => {
    const parent1 = genMembers.find(m => m.id === child.parents[0]);
    const parent2 = genMembers.find(m => m.id === child.parents[1]);

    if (parent1 && parent2) {
      const coupleKey = [parent1.id, parent2.id].sort().join('-');
      if (!paired.has(coupleKey)) {
        paired.add(coupleKey);
        couples.push([parent1, parent2]);
      }
    }
  });

  const unpairedMembers = genMembers.filter(m => 
    !paired.has(m.id) && ![...paired].some(key => key.includes(m.id))
  );

  return { couples, singles: unpairedMembers };
}

/**
 * Render the family tree
 */
function renderFamilyTree(data) {
  const container = document.getElementById('family-tree');
  const titleEl = document.getElementById('tree-title');
  const subtitleEl = document.getElementById('tree-subtitle');

  titleEl.textContent = data.title || 'Family Tree';
  subtitleEl.textContent = data.subtitle || '';
  document.title = data.title || 'Family Tree';

  container.innerHTML = '';

  const generations = groupByGeneration(data.members);
  const genNumbers = Object.keys(generations).map(Number).sort((a, b) => a - b);

  genNumbers.forEach((genNum, index) => {
    const genSection = document.createElement('div');
    genSection.className = 'generation';
    genSection.dataset.generation = genNum;

    const { couples, singles } = findCouples(data.members, genNum);

    couples.forEach(([member1, member2]) => {
      const coupleGroup = document.createElement('div');
      coupleGroup.className = 'couple-group';

      const card1 = createMemberCard(member1);
      const connector = document.createElement('div');
      connector.className = 'couple-connector';
      const card2 = createMemberCard(member2);

      coupleGroup.appendChild(card1);
      coupleGroup.appendChild(connector);
      coupleGroup.appendChild(card2);
      genSection.appendChild(coupleGroup);
    });

    singles.forEach(member => {
      const card = createMemberCard(member);
      genSection.appendChild(card);
    });

    container.appendChild(genSection);

    // Add spacing between generations
    if (index < genNumbers.length - 1) {
      const separator = document.createElement('div');
      separator.className = 'generation-separator';
      container.appendChild(separator);
    }
  });

  // Draw connections and set up interactivity
  requestAnimationFrame(() => {
    drawConnections(data.members, container);
    setupInteractivity(data.members, container);
  });
}

/**
 * Get all generation row boundaries (bottom of each gen row's cards)
 * This helps us route lines through empty space only.
 */
function getGenerationBounds(members, container, containerRect) {
  const generations = groupByGeneration(members);
  const bounds = {};

  Object.keys(generations).forEach(gen => {
    let minTop = Infinity;
    let maxBottom = -Infinity;

    generations[gen].forEach(member => {
      const card = container.querySelector(`[data-id="${member.id}"]`);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const top = rect.top - containerRect.top;
      const bottom = rect.top + rect.height - containerRect.top;
      if (top < minTop) minTop = top;
      if (bottom > maxBottom) maxBottom = bottom;
    });

    bounds[gen] = { top: minTop, bottom: maxBottom };
  });

  return bounds;
}

/**
 * Draw SVG connection lines between related members.
 * 
 * NEW APPROACH - Lines never cross through cards:
 * - For each parent→child connection, find the gap BETWEEN the generation rows
 * - Route horizontal segments ONLY in that gap
 * - Each parent group uses a unique Y within the gap (stacked offsets)
 * - Individual vertical lines from parent bottom to gap, and gap to child top
 */
function drawConnections(members, container) {
  const existingSvg = container.querySelector('.connection-lines');
  if (existingSvg) existingSvg.remove();

  connectionGroups = [];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('connection-lines');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.pointerEvents = 'none';
  svg.style.zIndex = '1';

  const containerRect = container.getBoundingClientRect();

  // Get generation boundaries
  const genBounds = getGenerationBounds(members, container, containerRect);

  function getCardMetrics(id) {
    const card = container.querySelector(`[data-id="${id}"]`);
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - containerRect.left,
      top: rect.top - containerRect.top,
      bottom: rect.top + rect.height - containerRect.top,
      left: rect.left - containerRect.left,
      right: rect.left + rect.width - containerRect.left,
      midY: rect.top + rect.height / 2 - containerRect.top
    };
  }

  function makeLine(x1, y1, x2, y2, color, groupId) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('data-group', groupId);
    line.style.pointerEvents = 'stroke';
    line.style.cursor = 'pointer';
    svg.appendChild(line);
    return line;
  }

  // Track Y offsets used in each gap region to prevent overlap
  // Key: "parentGen-childGen", Value: next available Y offset
  const gapOffsets = {};
  const GAP_STEP = 5;

  function getBarY(parentGen, childGen) {
    const key = `${parentGen}-${childGen}`;
    const parentBottom = genBounds[parentGen] ? genBounds[parentGen].bottom : 0;
    const childTop = genBounds[childGen] ? genBounds[childGen].top : parentBottom + 80;

    // The available gap between parent row bottom and child row top
    const gapStart = parentBottom + 8;
    const gapEnd = childTop - 8;

    if (!gapOffsets[key]) {
      gapOffsets[key] = gapStart;
    }

    const y = gapOffsets[key];
    gapOffsets[key] += GAP_STEP;

    // If we've exceeded the gap, cycle back (shouldn't happen with reasonable data)
    if (gapOffsets[key] > gapEnd) {
      gapOffsets[key] = gapStart;
    }

    return y;
  }

  let colorIdx = 0;

  // ===== COUPLE CONNECTIONS (two parents → children) =====
  const coupleMap = new Map();

  members.forEach(member => {
    if (!member.parents || member.parents.length < 2) return;
    const key = [...member.parents].sort().join('-');
    if (!coupleMap.has(key)) {
      coupleMap.set(key, { parents: member.parents, children: [] });
    }
    coupleMap.get(key).children.push(member.id);
  });

  coupleMap.forEach(({ parents, children }) => {
    const p1 = getCardMetrics(parents[0]);
    const p2 = getCardMetrics(parents[1]);
    if (!p1 || !p2) return;

    const color = LINE_COLORS[colorIdx % LINE_COLORS.length];
    colorIdx++;
    const groupId = parents.sort().join('-');

    // Store connection group for interactivity
    connectionGroups.push({
      id: groupId,
      color: color,
      memberIds: [...parents, ...children]
    });

    // Couple connector line
    const leftParent = p1.x < p2.x ? p1 : p2;
    const rightParent = p1.x < p2.x ? p2 : p1;
    const coupleLineY = (leftParent.midY + rightParent.midY) / 2;
    makeLine(leftParent.right, coupleLineY, rightParent.left, coupleLineY, color, groupId);

    // Midpoint
    const coupleMidX = (leftParent.right + rightParent.left) / 2;

    // Get child metrics
    const childMetrics = children.map(id => ({ id, ...getCardMetrics(id) })).filter(c => c.x !== undefined);
    if (childMetrics.length === 0) return;

    // Determine parent and child generations
    const parentMember = members.find(m => m.id === parents[0]);
    const childMember = members.find(m => m.id === children[0]);
    const parentGen = parentMember ? parentMember.generation : 1;
    const childGen = childMember ? childMember.generation : parentGen + 1;

    // Get the Y level for this group's horizontal bar (in the gap between generations)
    const barY = getBarY(parentGen, childGen);

    // Vertical trunk from couple midpoint down to bar Y
    makeLine(coupleMidX, coupleLineY, coupleMidX, barY, color, groupId);

    // Horizontal bar spanning from coupleMidX to all children
    const allXs = [coupleMidX, ...childMetrics.map(c => c.x)];
    const barLeft = Math.min(...allXs);
    const barRight = Math.max(...allXs);
    makeLine(barLeft, barY, barRight, barY, color, groupId);

    // Vertical drops from bar to each child
    childMetrics.forEach(child => {
      makeLine(child.x, barY, child.x, child.top, color, groupId);
    });
  });

  // ===== SINGLE-PARENT CONNECTIONS =====
  const singleParentMap = new Map();

  members.forEach(member => {
    if (!member.parents || member.parents.length !== 1) return;
    const parentId = member.parents[0];
    if (!singleParentMap.has(parentId)) {
      singleParentMap.set(parentId, []);
    }
    singleParentMap.get(parentId).push(member.id);
  });

  singleParentMap.forEach((childIds, parentId) => {
    const parent = getCardMetrics(parentId);
    if (!parent) return;

    const color = LINE_COLORS[colorIdx % LINE_COLORS.length];
    colorIdx++;
    const groupId = `single-${parentId}`;

    connectionGroups.push({
      id: groupId,
      color: color,
      memberIds: [parentId, ...childIds]
    });

    const childMetrics = childIds.map(id => ({ id, ...getCardMetrics(id) })).filter(c => c.x !== undefined);
    if (childMetrics.length === 0) return;

    // Determine generations
    const parentMember = members.find(m => m.id === parentId);
    const childMember = members.find(m => m.id === childIds[0]);
    const parentGen = parentMember ? parentMember.generation : 1;
    const childGen = childMember ? childMember.generation : parentGen + 1;

    // Get unique bar Y in the gap
    const barY = getBarY(parentGen, childGen);

    // Vertical trunk from parent bottom to bar
    makeLine(parent.x, parent.bottom, parent.x, barY, color, groupId);

    // Horizontal bar
    const allXs = [parent.x, ...childMetrics.map(c => c.x)];
    const barLeft = Math.min(...allXs);
    const barRight = Math.max(...allXs);

    if (barLeft !== barRight) {
      makeLine(barLeft, barY, barRight, barY, color, groupId);
    }

    // Vertical drops to each child
    childMetrics.forEach(child => {
      makeLine(child.x, barY, child.x, child.top, color, groupId);
    });
  });

  container.style.position = 'relative';
  container.appendChild(svg);
}

/**
 * Set up click interactivity for highlighting
 */
function setupInteractivity(members, container) {
  const svg = container.querySelector('.connection-lines');
  if (!svg) return;

  // Build a lookup: memberId → all related memberIds (parents + children + siblings)
  function getRelatedIds(memberId) {
    const related = new Set([memberId]);
    const member = members.find(m => m.id === memberId);
    if (!member) return related;

    // Add parents
    if (member.parents) {
      member.parents.forEach(pid => related.add(pid));
    }

    // Add children
    members.forEach(m => {
      if (m.parents && m.parents.includes(memberId)) {
        related.add(m.id);
      }
    });

    // Add siblings (same parents)
    if (member.parents && member.parents.length > 0) {
      members.forEach(m => {
        if (m.id === memberId) return;
        if (m.parents && member.parents.every(p => m.parents.includes(p))) {
          related.add(m.id);
        }
      });
    }

    return related;
  }

  // Get all group IDs that involve a member
  function getGroupsForMember(memberId) {
    return connectionGroups.filter(g => g.memberIds.includes(memberId));
  }

  // Highlight a set of members and their connection lines
  function highlight(memberIds, groupIds) {
    // Dim all cards
    container.querySelectorAll('.member-card').forEach(card => {
      card.classList.add('dimmed');
      card.classList.remove('highlighted');
    });

    // Highlight selected cards
    memberIds.forEach(id => {
      const card = container.querySelector(`[data-id="${id}"]`);
      if (card) {
        card.classList.remove('dimmed');
        card.classList.add('highlighted');
      }
    });

    // Dim all lines
    svg.querySelectorAll('line').forEach(line => {
      line.setAttribute('opacity', '0.1');
      line.setAttribute('stroke-width', '1');
    });

    // Highlight relevant lines
    groupIds.forEach(gid => {
      svg.querySelectorAll(`line[data-group="${gid}"]`).forEach(line => {
        line.setAttribute('opacity', '1');
        line.setAttribute('stroke-width', '3');
      });
    });
  }

  // Clear all highlights
  function clearHighlight() {
    container.querySelectorAll('.member-card').forEach(card => {
      card.classList.remove('dimmed');
      card.classList.remove('highlighted');
    });

    svg.querySelectorAll('line').forEach(line => {
      line.setAttribute('opacity', '1');
      line.setAttribute('stroke-width', '2');
    });
  }

  // Click on a card
  container.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const memberId = card.dataset.id;
      const relatedIds = getRelatedIds(memberId);
      const groups = getGroupsForMember(memberId);
      const groupIds = groups.map(g => g.id);

      // Also include all members from those groups
      groups.forEach(g => g.memberIds.forEach(id => relatedIds.add(id)));

      highlight(relatedIds, groupIds);
    });
  });

  // Click on a line
  svg.style.pointerEvents = 'none';
  svg.querySelectorAll('line').forEach(line => {
    line.style.pointerEvents = 'stroke';
    line.style.cursor = 'pointer';
    line.addEventListener('click', (e) => {
      e.stopPropagation();
      const groupId = line.getAttribute('data-group');
      const group = connectionGroups.find(g => g.id === groupId);
      if (!group) return;

      const memberIds = new Set(group.memberIds);
      highlight(memberIds, [groupId]);
    });
  });

  // Click on background to clear
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.member-card') && !e.target.closest('.connection-lines')) {
      clearHighlight();
    }
  });
}

/**
 * Load the family data and render
 */
function init() {
  try {
    if (typeof FAMILY_DATA === 'undefined') {
      throw new Error('FAMILY_DATA not found. Make sure family-data.js is loaded before app.js');
    }

    renderFamilyTree(FAMILY_DATA);

    // Debounced redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const container = document.getElementById('family-tree');
        drawConnections(FAMILY_DATA.members, container);
        setupInteractivity(FAMILY_DATA.members, container);
      }, 150);
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const container = document.getElementById('family-tree');
        drawConnections(FAMILY_DATA.members, container);
        setupInteractivity(FAMILY_DATA.members, container);
      }, 300);
    });
  } catch (error) {
    console.error('Error loading family tree:', error);
    document.getElementById('family-tree').innerHTML = `
      <div style="text-align: center; padding: 60px; color: #e53935;">
        <h2>Could not load family data</h2>
        <p>Make sure <code>family-data.js</code> is in the same directory and loaded before <code>app.js</code>.</p>
        <p style="margin-top: 10px; color: #999; font-size: 0.9rem;">Error: ${error.message}</p>
      </div>
    `;
  }
}

// Start the app
init();
